package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.*;
import ar.edu.siglo21.socioclub.repository.ActividadRepository;
import ar.edu.siglo21.socioclub.repository.InscripcionRepository;
import ar.edu.siglo21.socioclub.repository.SocioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InscripcionServiceTest {

    // "Today" is fixed so age calculations are deterministic
    static final ZoneId ZONA = ZoneId.of("America/Argentina/Cordoba");
    static final LocalDate HOY = LocalDate.of(2026, 10, 29);

    @Mock
    SocioRepository socioRepository;
    @Mock
    ActividadRepository actividadRepository;
    @Mock
    InscripcionRepository inscripcionRepository;

    InscripcionService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(HOY.atStartOfDay(ZONA).toInstant(), ZONA);
        service = new InscripcionService(socioRepository, actividadRepository, inscripcionRepository, clock);
    }

    // ---------- success ----------

    @Test
    void inscribeCuandoCumpleTodasLasReglas() {
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(2L);
        when(inscripcionRepository.contarPorActividadYEstado(10L, EstadoInscripcion.ACTIVA)).thenReturn(39L);
        when(inscripcionRepository.save(any(Inscripcion.class))).thenAnswer(inv -> inv.getArgument(0));

        Inscripcion resultado = service.inscribir(1L, 10L);

        assertThat(resultado.getEstado()).isEqualTo(EstadoInscripcion.ACTIVA);
        assertThat(resultado.getFechaInscripcion()).isEqualTo(HOY);
        assertThat(resultado.getSocio()).isSameAs(socio);
        assertThat(resultado.getActividad()).isSameAs(actividad);
    }

    // ---------- RN1: cupo ----------

    @Test
    void rn1RechazaCuandoNoHayCupo() {
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(0L);
        when(inscripcionRepository.contarPorActividadYEstado(10L, EstadoInscripcion.ACTIVA)).thenReturn(40L);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> {
                    assertThat(e.getRegla()).isEqualTo("RN1");
                    assertThat(e.getMessage()).isEqualTo("La actividad no tiene cupo disponible");
                });
        verify(inscripcionRepository, never()).save(any());
    }

    // ---------- RN2: duplicado ----------

    @Test
    void rn2RechazaInscripcionDuplicada() {
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        when(inscripcionRepository.existsBySocioIdAndActividadIdAndEstado(1L, 10L, EstadoInscripcion.ACTIVA))
                .thenReturn(true);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> {
                    assertThat(e.getRegla()).isEqualTo("RN2");
                    assertThat(e.getMessage()).isEqualTo("El socio ya está inscripto en esta actividad");
                });
        verify(inscripcionRepository, never()).save(any());
    }

    @Test
    void rn2UnaBajaNoImpideVolverAInscribirse() {
        // existsBy...(ACTIVA) returns false when the only previous row is BAJA
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(0L);
        when(inscripcionRepository.contarPorActividadYEstado(10L, EstadoInscripcion.ACTIVA)).thenReturn(0L);
        when(inscripcionRepository.save(any(Inscripcion.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(service.inscribir(1L, 10L).getEstado()).isEqualTo(EstadoInscripcion.ACTIVA);
    }

    // ---------- RN3: edad ----------

    @Test
    void rn3RechazaSocioMasChicoQueLaEdadMinima() {
        // turns 6 tomorrow -> still 5 today
        Socio socio = socio(1L, HOY.minusYears(6).plusDays(1), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(0L);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> {
                    assertThat(e.getRegla()).isEqualTo("RN3");
                    assertThat(e.getMessage())
                            .isEqualTo("La edad del socio no está dentro del rango permitido (6 a 12 años)");
                });
    }

    @Test
    void rn3RechazaSocioMasGrandeQueLaEdadMaxima() {
        // turned 13 today
        Socio socio = socio(1L, HOY.minusYears(13), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(0L);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> assertThat(e.getRegla()).isEqualTo("RN3"));
    }

    @Test
    void rn3AceptaEdadExactamenteIgualALaMinima() {
        // turned 6 today
        assertThat(inscribirConNacimiento(HOY.minusYears(6)).getEstado()).isEqualTo(EstadoInscripcion.ACTIVA);
    }

    @Test
    void rn3AceptaEdadMaximaSiElCumpleañosEsManiana() {
        // turns 13 tomorrow -> still 12 today, which is allowed
        assertThat(inscribirConNacimiento(HOY.minusYears(13).plusDays(1)).getEstado())
                .isEqualTo(EstadoInscripcion.ACTIVA);
    }

    // ---------- RN4: moroso ----------

    @Test
    void rn4RechazaSocioMoroso() {
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.MOROSO);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> {
                    assertThat(e.getRegla()).isEqualTo("RN4");
                    assertThat(e.getMessage()).isEqualTo("Debe regularizar su cuota en secretaría");
                });
        verify(inscripcionRepository, never()).save(any());
    }

    // ---------- RN5: maximo 3 ----------

    @Test
    void rn5RechazaCuandoYaTieneTresActividades() {
        Socio socio = socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(3L);

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> {
                    assertThat(e.getRegla()).isEqualTo("RN5");
                    assertThat(e.getMessage()).isEqualTo("Alcanzó el máximo de 3 actividades");
                });
        verify(inscripcionRepository, never()).save(any());
    }

    // ---------- order of rules ----------

    @Test
    void morosoSeEvaluaAntesQueLosDemasRequisitos() {
        // moroso AND too young AND already enrolled: RN4 wins
        Socio socio = socio(1L, HOY.minusYears(2), EstadoCuota.MOROSO);
        dadoQueExisten(socio, futbolInfantil());

        assertThatThrownBy(() -> service.inscribir(1L, 10L))
                .isInstanceOfSatisfying(ReglaNegocioException.class, e -> assertThat(e.getRegla()).isEqualTo("RN4"));
    }

    // ---------- not found ----------

    @Test
    void inscribirFallaSiNoExisteElSocio() {
        when(socioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.inscribir(99L, 10L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void inscribirFallaSiNoExisteLaActividad() {
        when(socioRepository.findById(1L)).thenReturn(Optional.of(socio(1L, HOY.minusYears(10), EstadoCuota.AL_DIA)));
        when(actividadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.inscribir(1L, 99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    // ---------- baja logica ----------

    @Test
    void darDeBajaCambiaElEstadoSinBorrarLaFila() {
        Inscripcion inscripcion = new Inscripcion();
        inscripcion.setId(5L);
        inscripcion.setEstado(EstadoInscripcion.ACTIVA);
        when(inscripcionRepository.findById(5L)).thenReturn(Optional.of(inscripcion));
        when(inscripcionRepository.save(inscripcion)).thenReturn(inscripcion);

        Inscripcion resultado = service.darDeBaja(5L);

        assertThat(resultado.getEstado()).isEqualTo(EstadoInscripcion.BAJA);
        verify(inscripcionRepository, never()).delete(any());
        verify(inscripcionRepository, never()).deleteById(any());
    }

    @Test
    void darDeBajaFallaSiNoExiste() {
        when(inscripcionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.darDeBaja(404L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    // ---------- helpers ----------

    private Inscripcion inscribirConNacimiento(LocalDate nacimiento) {
        Socio socio = socio(1L, nacimiento, EstadoCuota.AL_DIA);
        Actividad actividad = futbolInfantil();
        dadoQueExisten(socio, actividad);
        sinDuplicado(socio, actividad);
        when(inscripcionRepository.contarPorSocioYEstado(1L, EstadoInscripcion.ACTIVA)).thenReturn(0L);
        when(inscripcionRepository.contarPorActividadYEstado(10L, EstadoInscripcion.ACTIVA)).thenReturn(0L);
        when(inscripcionRepository.save(any(Inscripcion.class))).thenAnswer(inv -> inv.getArgument(0));
        return service.inscribir(1L, 10L);
    }

    private void dadoQueExisten(Socio socio, Actividad actividad) {
        when(socioRepository.findById(socio.getId())).thenReturn(Optional.of(socio));
        when(actividadRepository.findById(actividad.getId())).thenReturn(Optional.of(actividad));
    }

    private void sinDuplicado(Socio socio, Actividad actividad) {
        when(inscripcionRepository.existsBySocioIdAndActividadIdAndEstado(
                socio.getId(), actividad.getId(), EstadoInscripcion.ACTIVA)).thenReturn(false);
    }

    private Socio socio(Long id, LocalDate nacimiento, EstadoCuota cuota) {
        Socio s = new Socio();
        s.setId(id);
        s.setFechaNacimiento(nacimiento);
        s.setEstadoCuota(cuota);
        return s;
    }

    private Actividad futbolInfantil() {
        Actividad a = new Actividad();
        a.setId(10L);
        a.setNombre("Fútbol infantil");
        a.setEdadMinima(6);
        a.setEdadMaxima(12);
        a.setCupoMaximo(40);
        a.setCuotaMensual(new BigDecimal("18000"));
        return a;
    }
}
