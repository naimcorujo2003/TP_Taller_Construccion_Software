package ar.edu.siglo21.socioclub.dto;

import ar.edu.siglo21.socioclub.model.EstadoInscripcion;
import ar.edu.siglo21.socioclub.model.Inscripcion;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Why a DTO: Socio has a list of Inscripcion and each Inscripcion points back to its Socio, so serialising the
 * entities directly would loop forever (Socio -> Inscripcion -> Socio -> ...). This record is flat: it carries
 * only ids and the few activity fields the client needs, so there is no cycle.
 */
public record InscripcionDto(Long id, LocalDate fechaInscripcion, EstadoInscripcion estado, Long socioId,
                             Long actividadId, String actividadNombre, String dias, String horario,
                             BigDecimal cuotaMensual) {

    public static InscripcionDto from(Inscripcion i) {
        return new InscripcionDto(i.getId(), i.getFechaInscripcion(), i.getEstado(), i.getSocio().getId(),
                i.getActividad().getId(), i.getActividad().getNombre(), i.getActividad().getDias(),
                i.getActividad().getHorario(), i.getActividad().getCuotaMensual());
    }
}
