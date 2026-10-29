package ar.edu.siglo21.socioclub.repository;

import ar.edu.siglo21.socioclub.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// Runs against in-memory H2 with empty tables (data.sql is disabled here)
@DataJpaTest
@TestPropertySource(properties = "spring.sql.init.mode=never")
class RepositoriosTest {

    @Autowired
    SocioRepository socioRepository;
    @Autowired
    ActividadRepository actividadRepository;
    @Autowired
    InscripcionRepository inscripcionRepository;

    Socio ana;
    Socio luis;
    Actividad futbol;
    Actividad yoga;

    @BeforeEach
    void datos() {
        ana = socioRepository.save(socio("30111222", "Ana", "Perez"));
        luis = socioRepository.save(socio("30333444", "Luis", "Perezoso"));
        socioRepository.save(socio("30555666", "Marta", "Gomez"));
        futbol = actividadRepository.save(actividad("Fútbol infantil", "Fútbol"));
        yoga = actividadRepository.save(actividad("Yoga", "Bienestar"));
        inscripcion(ana, futbol, EstadoInscripcion.ACTIVA);
        inscripcion(ana, yoga, EstadoInscripcion.BAJA);
        inscripcion(luis, futbol, EstadoInscripcion.ACTIVA);
    }

    @Test
    void findByDni() {
        assertThat(socioRepository.findByDni("30111222")).get().extracting(Socio::getNombre).isEqualTo("Ana");
        assertThat(socioRepository.findByDni("00000000")).isEmpty();
    }

    @Test
    void buscarPorApellidoIgnoraMayusculasYPagina() {
        var pagina = socioRepository.findByApellidoContainingIgnoreCase("PEREZ", PageRequest.of(0, 1));
        assertThat(pagina.getTotalElements()).isEqualTo(2);
        assertThat(pagina.getContent()).hasSize(1);
        assertThat(pagina.getTotalPages()).isEqualTo(2);
    }

    @Test
    void findByDisciplinaIgnoreCase() {
        assertThat(actividadRepository.findByDisciplinaIgnoreCase("fútbol")).hasSize(1);
        assertThat(actividadRepository.findByDisciplinaIgnoreCase("Ajedrez")).isEmpty();
    }

    @Test
    void contarActivasPorActividadIgnoraBajas() {
        assertThat(inscripcionRepository.contarPorActividadYEstado(futbol.getId(), EstadoInscripcion.ACTIVA)).isEqualTo(2);
        assertThat(inscripcionRepository.contarPorActividadYEstado(yoga.getId(), EstadoInscripcion.ACTIVA)).isZero();
    }

    @Test
    void contarActivasPorSocio() {
        assertThat(inscripcionRepository.contarPorSocioYEstado(ana.getId(), EstadoInscripcion.ACTIVA)).isEqualTo(1);
    }

    @Test
    void derivedQueriesPorSocioYEstado() {
        List<Inscripcion> activas = inscripcionRepository.findBySocioIdAndEstado(ana.getId(), EstadoInscripcion.ACTIVA);
        assertThat(activas).hasSize(1);
        assertThat(activas.get(0).getActividad().getNombre()).isEqualTo("Fútbol infantil");
        assertThat(inscripcionRepository.existsBySocioIdAndActividadIdAndEstado(
                ana.getId(), futbol.getId(), EstadoInscripcion.ACTIVA)).isTrue();
        assertThat(inscripcionRepository.existsBySocioIdAndActividadIdAndEstado(
                ana.getId(), yoga.getId(), EstadoInscripcion.ACTIVA)).isFalse();
    }

    @Test
    void inscriptosDeUnaActividad() {
        var inscriptos = inscripcionRepository.findInscriptosPorActividad(futbol.getId(), EstadoInscripcion.ACTIVA);
        assertThat(inscriptos).extracting(i -> i.getSocio().getApellido()).containsExactly("Perez", "Perezoso");
    }

    private Socio socio(String dni, String nombre, String apellido) {
        Socio s = new Socio();
        s.setDni(dni);
        s.setNombre(nombre);
        s.setApellido(apellido);
        s.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        return s;
    }

    private Actividad actividad(String nombre, String disciplina) {
        Actividad a = new Actividad();
        a.setNombre(nombre);
        a.setDisciplina(disciplina);
        a.setProfesor("Profe");
        a.setDias("Lun");
        a.setHorario("18:00");
        a.setEdadMinima(5);
        a.setEdadMaxima(60);
        a.setCupoMaximo(10);
        a.setCuotaMensual(new BigDecimal("1000"));
        return a;
    }

    private void inscripcion(Socio s, Actividad a, EstadoInscripcion estado) {
        Inscripcion i = new Inscripcion();
        i.setSocio(s);
        i.setActividad(a);
        i.setEstado(estado);
        i.setFechaInscripcion(LocalDate.of(2026, 1, 1));
        inscripcionRepository.save(i);
    }
}
