package ar.edu.siglo21.socioclub.dto;

import java.util.List;

/** Occupancy of every actividad plus the club-wide totals. */
public record PanelOcupacion(List<OcupacionActividad> actividades, int totalOcupados, int totalCupos) {
}
