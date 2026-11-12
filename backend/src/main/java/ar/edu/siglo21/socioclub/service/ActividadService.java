package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.dto.ActividadDto;
import ar.edu.siglo21.socioclub.dto.OcupacionActividad;
import ar.edu.siglo21.socioclub.dto.PanelOcupacion;
import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Actividad;
import ar.edu.siglo21.socioclub.model.EstadoInscripcion;
import ar.edu.siglo21.socioclub.repository.ActividadRepository;
import ar.edu.siglo21.socioclub.repository.InscripcionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActividadService {

    private final ActividadRepository actividadRepository;
    private final InscripcionRepository inscripcionRepository;

    public ActividadService(ActividadRepository actividadRepository, InscripcionRepository inscripcionRepository) {
        this.actividadRepository = actividadRepository;
        this.inscripcionRepository = inscripcionRepository;
    }

    @Transactional(readOnly = true)
    public List<ActividadDto> listarConCupo(String disciplina) {
        List<Actividad> actividades = (disciplina == null || disciplina.isBlank())
                ? actividadRepository.findAll()
                : actividadRepository.findByDisciplinaIgnoreCase(disciplina.trim());
        return actividades.stream().map(this::conCupo).toList();
    }

    @Transactional(readOnly = true)
    public Actividad buscarPorId(Long id) {
        return actividadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la actividad con id " + id));
    }

    @Transactional(readOnly = true)
    public ActividadDto detalleConCupo(Long id) {
        return conCupo(buscarPorId(id));
    }

    @Transactional
    public Actividad crear(Actividad actividad) {
        validarRangoDeEdades(actividad);
        actividad.setId(null);
        return actividadRepository.save(actividad);
    }

    @Transactional
    public Actividad actualizar(Long id, Actividad datos) {
        Actividad existente = buscarPorId(id);
        validarRangoDeEdades(datos);
        existente.setNombre(datos.getNombre());
        existente.setDisciplina(datos.getDisciplina());
        existente.setProfesor(datos.getProfesor());
        existente.setDias(datos.getDias());
        existente.setHorario(datos.getHorario());
        existente.setEdadMinima(datos.getEdadMinima());
        existente.setEdadMaxima(datos.getEdadMaxima());
        existente.setCupoMaximo(datos.getCupoMaximo());
        existente.setCuotaMensual(datos.getCuotaMensual());
        return actividadRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Actividad actividad = buscarPorId(id);
        if (contarActivas(actividad) > 0) {
            throw new ReglaNegocioException("ACTIVIDAD_CON_INSCRIPTOS",
                    "No se puede eliminar una actividad con inscriptos activos");
        }
        actividadRepository.delete(actividad);
    }

    /** Places left = cupoMaximo minus ACTIVA inscriptions (BAJA ones free their place). */
    public int cupoDisponible(Actividad actividad) {
        return actividad.getCupoMaximo() - (int) contarActivas(actividad);
    }

    /** Occupancy per actividad (one count query each, like the list page) plus club-wide totals. */
    @Transactional(readOnly = true)
    public PanelOcupacion panelOcupacion() {
        List<OcupacionActividad> filas = actividadRepository.findAll().stream().map(this::ocupacionDe).toList();
        int totalOcupados = filas.stream().mapToInt(OcupacionActividad::ocupados).sum();
        int totalCupos = filas.stream().mapToInt(OcupacionActividad::cupoMaximo).sum();
        return new PanelOcupacion(filas, totalOcupados, totalCupos);
    }

    private OcupacionActividad ocupacionDe(Actividad actividad) {
        int ocupados = (int) contarActivas(actividad);
        int cupo = actividad.getCupoMaximo();
        // Floor division so 79.9% is never promoted to the 80% threshold; no capacity counts as full
        int porcentaje = cupo <= 0 ? 100 : Math.min(100, ocupados * 100 / cupo);
        String estado = porcentaje >= 100 ? "Completa" : porcentaje >= 80 ? "Casi completa" : "Disponible";
        return new OcupacionActividad(actividad.getId(), actividad.getNombre(), actividad.getDisciplina(),
                ocupados, cupo, porcentaje, estado);
    }

    private void validarRangoDeEdades(Actividad actividad) {
        if (actividad.getEdadMinima() != null && actividad.getEdadMaxima() != null
                && actividad.getEdadMinima() > actividad.getEdadMaxima()) {
            throw new ReglaNegocioException("RANGO_EDAD", "La edad mínima no puede ser mayor que la edad máxima");
        }
    }

    private ActividadDto conCupo(Actividad actividad) {
        return ActividadDto.from(actividad, cupoDisponible(actividad));
    }

    private long contarActivas(Actividad actividad) {
        return inscripcionRepository.contarPorActividadYEstado(actividad.getId(), EstadoInscripcion.ACTIVA);
    }
}
