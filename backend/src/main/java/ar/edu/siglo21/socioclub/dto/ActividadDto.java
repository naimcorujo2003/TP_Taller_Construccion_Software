package ar.edu.siglo21.socioclub.dto;

import ar.edu.siglo21.socioclub.model.Actividad;

import java.math.BigDecimal;

/** Flat view of an Actividad plus its available places. It has no list of inscripciones, so no JSON cycle. */
public record ActividadDto(
        Long id,
        String nombre,
        String disciplina,
        String profesor,
        String dias,
        String horario,
        Integer edadMinima,
        Integer edadMaxima,
        Integer cupoMaximo,
        BigDecimal cuotaMensual,
        int cupoDisponible) {

    public static ActividadDto from(Actividad a, int cupoDisponible) {
        return new ActividadDto(a.getId(), a.getNombre(), a.getDisciplina(), a.getProfesor(), a.getDias(),
                a.getHorario(), a.getEdadMinima(), a.getEdadMaxima(), a.getCupoMaximo(), a.getCuotaMensual(),
                cupoDisponible);
    }
}
