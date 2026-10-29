package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Socio;
import ar.edu.siglo21.socioclub.repository.SocioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SocioService {

    private final SocioRepository socioRepository;

    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    /** Paged list; a blank apellido returns every socio. */
    @Transactional(readOnly = true)
    public Page<Socio> buscar(String apellido, Pageable pageable) {
        if (apellido == null || apellido.isBlank()) {
            return socioRepository.findAll(pageable);
        }
        return socioRepository.findByApellidoContainingIgnoreCase(apellido.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public List<Socio> listarTodos() {
        return socioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Socio buscarPorId(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el socio con id " + id));
    }

    @Transactional(readOnly = true)
    public Socio buscarPorDni(String dni) {
        return socioRepository.findByDni(dni)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un socio con DNI " + dni));
    }

    @Transactional
    public Socio crear(Socio socio) {
        if (socioRepository.existsByDni(socio.getDni())) {
            throw new ReglaNegocioException("DNI_DUPLICADO", "Ya existe un socio con DNI " + socio.getDni());
        }
        socio.setId(null);
        return socioRepository.save(socio);
    }

    @Transactional
    public Socio actualizar(Long id, Socio datos) {
        Socio existente = buscarPorId(id);
        if (!existente.getDni().equals(datos.getDni()) && socioRepository.existsByDni(datos.getDni())) {
            throw new ReglaNegocioException("DNI_DUPLICADO", "Ya existe un socio con DNI " + datos.getDni());
        }
        existente.setDni(datos.getDni());
        existente.setNombre(datos.getNombre());
        existente.setApellido(datos.getApellido());
        existente.setFechaNacimiento(datos.getFechaNacimiento());
        existente.setEmail(datos.getEmail());
        existente.setTelefono(datos.getTelefono());
        existente.setEstadoCuota(datos.getEstadoCuota());
        return socioRepository.save(existente);
    }
}
