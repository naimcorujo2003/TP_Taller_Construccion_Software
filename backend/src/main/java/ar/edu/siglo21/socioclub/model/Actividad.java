package ar.edu.siglo21.socioclub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "actividad")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @NotBlank(message = "La disciplina es obligatoria")
    @Column(nullable = false)
    private String disciplina;

    @NotBlank(message = "El profesor es obligatorio")
    @Column(nullable = false)
    private String profesor;

    @NotBlank(message = "Los días son obligatorios")
    @Column(nullable = false)
    private String dias;

    @NotBlank(message = "El horario es obligatorio")
    @Column(nullable = false)
    private String horario;

    @NotNull(message = "La edad mínima es obligatoria")
    @Min(value = 0, message = "La edad mínima no puede ser negativa")
    @Column(nullable = false)
    private Integer edadMinima;

    @NotNull(message = "La edad máxima es obligatoria")
    @Min(value = 0, message = "La edad máxima no puede ser negativa")
    @Column(nullable = false)
    private Integer edadMaxima;

    @NotNull(message = "El cupo máximo es obligatorio")
    @Min(value = 1, message = "El cupo máximo debe ser al menos 1")
    @Column(nullable = false)
    private Integer cupoMaximo;

    @NotNull(message = "La cuota mensual es obligatoria")
    @DecimalMin(value = "0.0", message = "La cuota mensual no puede ser negativa")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cuotaMensual;

    // Inverse side of Inscripcion.actividad; never serialised directly (see dto package)
    @OneToMany(mappedBy = "actividad")
    private List<Inscripcion> inscripciones = new ArrayList<>();

    public Actividad() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDisciplina() {
        return disciplina;
    }

    public void setDisciplina(String disciplina) {
        this.disciplina = disciplina;
    }

    public String getProfesor() {
        return profesor;
    }

    public void setProfesor(String profesor) {
        this.profesor = profesor;
    }

    public String getDias() {
        return dias;
    }

    public void setDias(String dias) {
        this.dias = dias;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public Integer getEdadMinima() {
        return edadMinima;
    }

    public void setEdadMinima(Integer edadMinima) {
        this.edadMinima = edadMinima;
    }

    public Integer getEdadMaxima() {
        return edadMaxima;
    }

    public void setEdadMaxima(Integer edadMaxima) {
        this.edadMaxima = edadMaxima;
    }

    public Integer getCupoMaximo() {
        return cupoMaximo;
    }

    public void setCupoMaximo(Integer cupoMaximo) {
        this.cupoMaximo = cupoMaximo;
    }

    public BigDecimal getCuotaMensual() {
        return cuotaMensual;
    }

    public void setCuotaMensual(BigDecimal cuotaMensual) {
        this.cuotaMensual = cuotaMensual;
    }

    public List<Inscripcion> getInscripciones() {
        return inscripciones;
    }

    public void setInscripciones(List<Inscripcion> inscripciones) {
        this.inscripciones = inscripciones;
    }
}
