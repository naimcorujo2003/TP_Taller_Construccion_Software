package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.*;
import ar.edu.siglo21.socioclub.repository.ActividadRepository;
import ar.edu.siglo21.socioclub.repository.InscripcionRepository;
import ar.edu.siglo21.socioclub.repository.SocioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/** Business rules RN1..RN5 live here, so MVC and REST controllers validate exactly the same way. */
@Service
public class InscripcionService {

    static final int MAX_ACTIVIDADES_POR_SOCIO = 3;

    private final SocioRepository socioRepository;
    private final ActividadRepository actividadRepository;
    private final InscripcionRepository inscripcionRepository;
    private final Clock clock;

    public InscripcionService(SocioRepository socioRepository, ActividadRepository actividadRepository,
                              InscripcionRepository inscripcionRepository, Clock clock) {
        this.socioRepository = socioRepository;
        this.actividadRepository = actividadRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.clock = clock;
    }

    @Transactional
    public Inscripcion inscribir(Long socioId, Long actividadId) {
        Socio socio = socioRepository.findById(socioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el socio con id " + socioId));
        Actividad actividad = actividadRepository.findById(actividadId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la actividad con id " + actividadId));

        validarCuotaAlDia(socio);                       // RN4
        validarSinDuplicado(socio, actividad);          // RN2
        validarMaximoDeActividades(socio);              // RN5
        validarEdad(socio, actividad);                  // RN3
        validarCupo(actividad);                         // RN1

        Inscripcion inscripcion = new Inscripcion();
        inscripcion.setSocio(socio);
        inscripcion.setActividad(actividad);
        inscripcion.setEstado(EstadoInscripcion.ACTIVA);
        inscripcion.setFechaInscripcion(LocalDate.now(clock));
        return inscripcionRepository.save(inscripcion);
    }

    /** Logical delete: the row stays, only its estado changes to BAJA. */
    @Transactional
    public Inscripcion darDeBaja(Long inscripcionId) {
        Inscripcion inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la inscripción con id " + inscripcionId));
        inscripcion.setEstado(EstadoInscripcion.BAJA);
        return inscripcionRepository.save(inscripcion);
    }

    @Transactional(readOnly = true)
    public List<Inscripcion> listarActivasDeSocio(Long socioId) {
        if (!socioRepository.existsById(socioId)) {
            throw new RecursoNoEncontradoException("No existe el socio con id " + socioId);
        }
        return inscripcionRepository.findBySocioIdAndEstado(socioId, EstadoInscripcion.ACTIVA);
    }

    @Transactional(readOnly = true)
    public List<Inscripcion> listarInscriptos(Long actividadId) {
        if (!actividadRepository.existsById(actividadId)) {
            throw new RecursoNoEncontradoException("No existe la actividad con id " + actividadId);
        }
        return inscripcionRepository.findInscriptosPorActividad(actividadId, EstadoInscripcion.ACTIVA);
    }

    private void validarCuotaAlDia(Socio socio) {
        if (socio.getEstadoCuota() == EstadoCuota.MOROSO) {
            throw new ReglaNegocioException("RN4", "Debe regularizar su cuota en secretaría");
        }
    }

    private void validarSinDuplicado(Socio socio, Actividad actividad) {
        if (inscripcionRepository.existsBySocioIdAndActividadIdAndEstado(
                socio.getId(), actividad.getId(), EstadoInscripcion.ACTIVA)) {
            throw new ReglaNegocioException("RN2", "El socio ya está inscripto en esta actividad");
        }
    }

    private void validarMaximoDeActividades(Socio socio) {
        long activas = inscripcionRepository.contarPorSocioYEstado(socio.getId(), EstadoInscripcion.ACTIVA);
        if (activas >= MAX_ACTIVIDADES_POR_SOCIO) {
            throw new ReglaNegocioException("RN5", "Alcanzó el máximo de 3 actividades");
        }
    }

    private void validarEdad(Socio socio, Actividad actividad) {
        // Period counts only completed years, so a birthday tomorrow does not count yet
        int edad = Period.between(socio.getFechaNacimiento(), LocalDate.now(clock)).getYears();
        if (edad < actividad.getEdadMinima() || edad > actividad.getEdadMaxima()) {
            throw new ReglaNegocioException("RN3", "La edad del socio no está dentro del rango permitido ("
                    + actividad.getEdadMinima() + " a " + actividad.getEdadMaxima() + " años)");
        }
    }

    private void validarCupo(Actividad actividad) {
        long activas = inscripcionRepository.contarPorActividadYEstado(actividad.getId(), EstadoInscripcion.ACTIVA);
        if (activas >= actividad.getCupoMaximo()) {
            throw new ReglaNegocioException("RN1", "La actividad no tiene cupo disponible");
        }
    }
}
