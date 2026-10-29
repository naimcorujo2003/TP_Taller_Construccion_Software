package ar.edu.siglo21.socioclub;

import ar.edu.siglo21.socioclub.model.Actividad;
import ar.edu.siglo21.socioclub.model.EstadoCuota;
import ar.edu.siglo21.socioclub.model.EstadoInscripcion;
import ar.edu.siglo21.socioclub.repository.ActividadRepository;
import ar.edu.siglo21.socioclub.repository.InscripcionRepository;
import ar.edu.siglo21.socioclub.repository.SocioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

// Loads the full context against H2 and checks that data.sql produced the data the assignment asks for
@SpringBootTest
class DatosInicialesTest {

    @Autowired
    ActividadRepository actividadRepository;
    @Autowired
    SocioRepository socioRepository;
    @Autowired
    InscripcionRepository inscripcionRepository;

    @Test
    void cargaLasOchoActividadesDelEnunciado() {
        assertThat(actividadRepository.findAll()).extracting(Actividad::getNombre).containsExactly(
                "Fútbol infantil", "Vóley mixto", "Básquet juvenil", "Natación",
                "Patín artístico", "Ajedrez", "Funcional adultos", "Yoga");
        Actividad futbol = actividadRepository.findByDisciplinaIgnoreCase("Fútbol").get(0);
        assertThat(futbol.getEdadMinima()).isEqualTo(6);
        assertThat(futbol.getEdadMaxima()).isEqualTo(12);
        assertThat(futbol.getCupoMaximo()).isEqualTo(40);
        assertThat(futbol.getCuotaMensual()).isEqualByComparingTo("18000");
    }

    @Test
    void cargaAlMenosQuinceSociosConDosMorosos() {
        assertThat(socioRepository.count()).isGreaterThanOrEqualTo(15);
        assertThat(socioRepository.findAll().stream().filter(s -> s.getEstadoCuota() == EstadoCuota.MOROSO).count())
                .isGreaterThanOrEqualTo(2);
    }

    @Test
    void yogaEstaLlenoYAjedrezCasiLleno() {
        Actividad yoga = actividadRepository.findByDisciplinaIgnoreCase("Bienestar").get(0);
        Actividad ajedrez = actividadRepository.findByDisciplinaIgnoreCase("Ajedrez").get(0);
        assertThat(inscripcionRepository.contarPorActividadYEstado(yoga.getId(), EstadoInscripcion.ACTIVA))
                .isEqualTo((long) yoga.getCupoMaximo());
        assertThat(inscripcionRepository.contarPorActividadYEstado(ajedrez.getId(), EstadoInscripcion.ACTIVA))
                .isEqualTo(ajedrez.getCupoMaximo() - 1L);
    }

    @Test
    void unSocioYaTieneTresActividades() {
        Long lauraId = socioRepository.findByDni("28333001").orElseThrow().getId();
        assertThat(inscripcionRepository.contarPorSocioYEstado(lauraId, EstadoInscripcion.ACTIVA)).isEqualTo(3);
    }
}
