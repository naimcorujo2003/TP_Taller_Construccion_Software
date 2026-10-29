package ar.edu.siglo21.socioclub.dto;

import jakarta.validation.constraints.NotNull;

/** JSON body of POST /api/inscripciones. */
public record InscripcionRequest(
        @NotNull(message = "socioId es obligatorio") Long socioId,
        @NotNull(message = "actividadId es obligatorio") Long actividadId) {
}
