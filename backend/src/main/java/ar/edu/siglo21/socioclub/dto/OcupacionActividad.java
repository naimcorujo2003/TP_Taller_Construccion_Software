package ar.edu.siglo21.socioclub.dto;

/** Occupancy of one actividad for the secretaría panel: active inscriptions vs. capacity. */
public record OcupacionActividad(
        Long id,
        String nombre,
        String disciplina,
        int ocupados,
        int cupoMaximo,
        int porcentaje,
        String estado) {
}
