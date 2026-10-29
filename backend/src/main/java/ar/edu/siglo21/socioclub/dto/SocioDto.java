package ar.edu.siglo21.socioclub.dto;

import ar.edu.siglo21.socioclub.model.EstadoCuota;
import ar.edu.siglo21.socioclub.model.Socio;

import java.time.LocalDate;

/** Socio without its list of inscripciones (see InscripcionDto for why). */
public record SocioDto(Long id, String dni, String nombre, String apellido, LocalDate fechaNacimiento,
                       String email, String telefono, EstadoCuota estadoCuota) {

    public static SocioDto from(Socio s) {
        return new SocioDto(s.getId(), s.getDni(), s.getNombre(), s.getApellido(), s.getFechaNacimiento(),
                s.getEmail(), s.getTelefono(), s.getEstadoCuota());
    }
}
