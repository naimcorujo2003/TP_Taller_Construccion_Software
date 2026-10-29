package ar.edu.siglo21.socioclub.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// End-to-end checks of Annex A against the seeded H2 data. Ids come from data.sql.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiRestTest {

    static final String ACTIVIDAD_JSON = """
            {"nombre":"Tenis","disciplina":"Tenis","profesor":"Ana Ruiz","dias":"Sáb","horario":"11:00",
             "edadMinima":8,"edadMaxima":60,"cupoMaximo":10,"cuotaMensual":15000}""";

    @Autowired
    MockMvc mvc;

    // ---------- actividades ----------

    @Test
    void listaActividadesConCupoDisponible() throws Exception {
        mvc.perform(get("/api/actividades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(8)))
                .andExpect(jsonPath("$[7].nombre").value("Yoga"))
                .andExpect(jsonPath("$[7].cupoDisponible").value(0))
                .andExpect(jsonPath("$[5].cupoDisponible").value(1));
    }

    @Test
    void filtraPorDisciplina() throws Exception {
        mvc.perform(get("/api/actividades").param("disciplina", "Fútbol"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Fútbol infantil"))
                .andExpect(jsonPath("$[0].cupoDisponible").value(37));
    }

    @Test
    void detalleDeActividad() throws Exception {
        mvc.perform(get("/api/actividades/1")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1));
        mvc.perform(get("/api/actividades/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void creaModificaYEliminaUnaActividad() throws Exception {
        String location = mvc.perform(post("/api/actividades").contentType(MediaType.APPLICATION_JSON).content(ACTIVIDAD_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cupoDisponible").value(10))
                .andReturn().getResponse().getHeader("Location");

        mvc.perform(put(location).contentType(MediaType.APPLICATION_JSON)
                        .content(ACTIVIDAD_JSON.replace("\"Tenis\",\"disciplina\"", "\"Tenis adultos\",\"disciplina\"")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Tenis adultos"));

        mvc.perform(delete(location)).andExpect(status().isNoContent());
        mvc.perform(delete(location)).andExpect(status().isNotFound());
    }

    @Test
    void actualizarActividadInexistenteDevuelve404() throws Exception {
        mvc.perform(put("/api/actividades/999").contentType(MediaType.APPLICATION_JSON).content(ACTIVIDAD_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearActividadInvalidaDevuelve400() throws Exception {
        mvc.perform(post("/api/actividades").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void eliminarActividadConInscriptosActivosDevuelve409() throws Exception {
        mvc.perform(delete("/api/actividades/8"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    // ---------- socios ----------

    @Test
    void buscaSocioPorDni() throws Exception {
        mvc.perform(get("/api/socios/dni/28333001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apellido").value("Fernández"))
                .andExpect(jsonPath("$.estadoCuota").value("AL_DIA"));
        mvc.perform(get("/api/socios/dni/11111111")).andExpect(status().isNotFound());
    }

    @Test
    void listaInscripcionesActivasDeUnSocio() throws Exception {
        mvc.perform(get("/api/socios/9/inscripciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].estado").value("ACTIVA"))
                .andExpect(jsonPath("$[0].actividadNombre").exists())
                .andExpect(jsonPath("$[0].socio").doesNotExist());
        mvc.perform(get("/api/socios/999/inscripciones")).andExpect(status().isNotFound());
    }

    // ---------- inscripciones ----------

    @Test
    void inscribeConExito() throws Exception {
        inscribir(1, 1)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("ACTIVA"))
                .andExpect(jsonPath("$.socioId").value(1))
                .andExpect(jsonPath("$.actividadId").value(1));
    }

    @Test
    void rn1SinCupoDevuelve409() throws Exception {
        inscribir(24, 8).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("La actividad no tiene cupo disponible"))
                .andExpect(jsonPath("$.regla").value("RN1"));
    }

    @Test
    void rn2DuplicadoDevuelve409() throws Exception {
        inscribir(2, 1).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("El socio ya está inscripto en esta actividad"))
                .andExpect(jsonPath("$.regla").value("RN2"));
    }

    @Test
    void rn3EdadFueraDeRangoDevuelve409() throws Exception {
        inscribir(6, 1).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("La edad del socio no está dentro del rango permitido (6 a 12 años)"))
                .andExpect(jsonPath("$.regla").value("RN3"));
    }

    @Test
    void rn4MorosoDevuelve409() throws Exception {
        inscribir(16, 4).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Debe regularizar su cuota en secretaría"))
                .andExpect(jsonPath("$.regla").value("RN4"));
    }

    @Test
    void rn5MaximoDeTresActividadesDevuelve409() throws Exception {
        inscribir(9, 7).andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Alcanzó el máximo de 3 actividades"))
                .andExpect(jsonPath("$.regla").value("RN5"));
    }

    @Test
    void inscribirConSocioOActividadInexistenteDevuelve404() throws Exception {
        inscribir(999, 1).andExpect(status().isNotFound());
        inscribir(1, 999).andExpect(status().isNotFound());
    }

    @Test
    void inscribirSinCuerpoValidoDevuelve400() throws Exception {
        mvc.perform(post("/api/inscripciones").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void bajaLogicaDevuelve200YLiberaElCupo() throws Exception {
        mvc.perform(put("/api/inscripciones/1/baja"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("BAJA"));
        mvc.perform(get("/api/actividades/1")).andExpect(jsonPath("$.cupoDisponible").value(38));
        mvc.perform(put("/api/inscripciones/999/baja")).andExpect(status().isNotFound());
    }

    // ---------- CORS ----------

    @Test
    void permiteElOrigenDeLaAppReact() throws Exception {
        mvc.perform(options("/api/actividades")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        mvc.perform(get("/api/actividades").header("Origin", "http://otro-sitio.com"))
                .andExpect(status().isForbidden());
    }

    private ResultActions inscribir(long socioId, long actividadId) throws Exception {
        return mvc.perform(post("/api/inscripciones").contentType(MediaType.APPLICATION_JSON)
                .content("{\"socioId\":" + socioId + ",\"actividadId\":" + actividadId + "}"));
    }
}
