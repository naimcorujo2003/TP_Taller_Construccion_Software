package ar.edu.siglo21.socioclub.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Renders every Thymeleaf page against the seeded H2 data (a template error would give a 500)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PaginasBackofficeTest {

    @Autowired
    MockMvc mvc;

    @Test
    void inicioRedirigeAActividades() throws Exception {
        mvc.perform(get("/")).andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/actividades"));
    }

    @Test
    void listaDeActividadesMuestraCupoYSinCupo() throws Exception {
        mvc.perform(get("/actividades"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Fútbol infantil")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Sin cupo")));
    }

    @Test
    void filtrarActividadesPorDisciplina() throws Exception {
        mvc.perform(get("/actividades").param("disciplina", "yoga"))
                .andExpect(status().isOk());
        mvc.perform(get("/actividades").param("disciplina", "Bienestar"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Yoga")))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Ajedrez"))));
    }

    @Test
    void formulariosDeActividad() throws Exception {
        mvc.perform(get("/actividades/nueva")).andExpect(status().isOk());
        mvc.perform(get("/actividades/1/editar")).andExpect(status().isOk());
        mvc.perform(get("/actividades/999/editar")).andExpect(status().isNotFound());
    }

    @Test
    void altaDeActividadInvalidaVuelveAlFormularioConErrores() throws Exception {
        mvc.perform(post("/actividades").param("nombre", ""))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("El nombre es obligatorio")));
    }

    @Test
    void altaDeActividadValidaRedirige() throws Exception {
        mvc.perform(post("/actividades")
                        .param("nombre", "Tenis").param("disciplina", "Tenis").param("profesor", "Ana")
                        .param("dias", "Sáb").param("horario", "11:00").param("edadMinima", "8")
                        .param("edadMaxima", "60").param("cupoMaximo", "10").param("cuotaMensual", "15000"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void listaDeSociosPaginadaYBusqueda() throws Exception {
        mvc.perform(get("/socios"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Siguiente")));
        mvc.perform(get("/socios").param("page", "2")).andExpect(status().isOk());
        mvc.perform(get("/socios").param("apellido", "rom"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Romero")));
    }

    @Test
    void formularioDeSocio() throws Exception {
        mvc.perform(get("/socios/nuevo")).andExpect(status().isOk());
        mvc.perform(get("/socios/1/editar")).andExpect(status().isOk());
    }

    @Test
    void altaDeSocioConDniInvalidoMuestraElError() throws Exception {
        mvc.perform(post("/socios").param("dni", "12.345").param("nombre", "A").param("apellido", "B")
                        .param("fechaNacimiento", "1990-01-01").param("estadoCuota", "AL_DIA"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("7 u 8 dígitos")));
    }

    @Test
    void formularioDeInscripcionYListadoDeInscriptos() throws Exception {
        mvc.perform(get("/inscripciones/nueva")).andExpect(status().isOk());
        mvc.perform(get("/actividades/8/inscriptos"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Sin cupo")));
    }

    @Test
    void inscripcionRechazadaMuestraElMensajeDeLaRegla() throws Exception {
        // socio 16 is MOROSO (RN4)
        mvc.perform(post("/inscripciones").param("socioId", "16").param("actividadId", "7"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Debe regularizar su cuota en secretaría")));
    }

    @Test
    void inscripcionValidaRedirigeAlListadoDeInscriptos() throws Exception {
        // socio 1 (8 years old, no activities) into Futbol infantil
        mvc.perform(post("/inscripciones").param("socioId", "1").param("actividadId", "1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/actividades/1/inscriptos"));
    }

    @Test
    void bajaDeInscripcionRedirigeAlListadoDeLaActividad() throws Exception {
        mvc.perform(post("/inscripciones/1/baja"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/actividades/1/inscriptos"));
    }
}
