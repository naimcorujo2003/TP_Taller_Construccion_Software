package ar.edu.siglo21.socioclub.dto;

import ar.edu.siglo21.socioclub.model.Actividad;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** JSON body for creating or updating an Actividad through the API. */
public record ActividadRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "La disciplina es obligatoria") String disciplina,
        @NotBlank(message = "El profesor es obligatorio") String profesor,
        @NotBlank(message = "Los días son obligatorios") String dias,
        @NotBlank(message = "El horario es obligatorio") String horario,
        @NotNull(message = "La edad mínima es obligatoria") @Min(value = 0, message = "La edad mínima no puede ser negativa") Integer edadMinima,
        @NotNull(message = "La edad máxima es obligatoria") @Min(value = 0, message = "La edad máxima no puede ser negativa") Integer edadMaxima,
        @NotNull(message = "El cupo máximo es obligatorio") @Min(value = 1, message = "El cupo máximo debe ser al menos 1") Integer cupoMaximo,
        @NotNull(message = "La cuota mensual es obligatoria") @DecimalMin(value = "0.0", message = "La cuota mensual no puede ser negativa") BigDecimal cuotaMensual) {

    public Actividad toEntity() {
        Actividad a = new Actividad();
        a.setNombre(nombre);
        a.setDisciplina(disciplina);
        a.setProfesor(profesor);
        a.setDias(dias);
        a.setHorario(horario);
        a.setEdadMinima(edadMinima);
        a.setEdadMaxima(edadMaxima);
        a.setCupoMaximo(cupoMaximo);
        a.setCuotaMensual(cuotaMensual);
        return a;
    }
}
