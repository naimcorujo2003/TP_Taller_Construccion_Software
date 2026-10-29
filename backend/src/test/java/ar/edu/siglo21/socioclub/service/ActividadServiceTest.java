package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.dto.ActividadDto;
import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Actividad;
import ar.edu.siglo21.socioclub.model.EstadoInscripcion;
import ar.edu.siglo21.socioclub.repository.ActividadRepository;
import ar.edu.siglo21.socioclub.repository.InscripcionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActividadServiceTest {

    @Mock
    ActividadRepository actividadRepository;
    @Mock
    InscripcionRepository inscripcionRepository;
    @InjectMocks
    ActividadService service;

    Actividad yoga;

    @BeforeEach
    void setUp() {
        yoga = new Actividad();
        yoga.setId(8L);
        yoga.setNombre("Yoga");
        yoga.setDisciplina("Bienestar");
        yoga.setCupoMaximo(15);
        yoga.setCuotaMensual(new BigDecimal("17000"));
    }

    @Test
    void cupoDisponibleEsMaximoMenosInscriptosActivos() {
        when(inscripcionRepository.contarPorActividadYEstado(8L, EstadoInscripcion.ACTIVA)).thenReturn(14L);

        assertThat(service.cupoDisponible(yoga)).isEqualTo(1);
    }

    @Test
    void listarConCupoIncluyeElCupoDisponibleDeCadaActividad() {
        when(actividadRepository.findAll()).thenReturn(List.of(yoga));
        when(inscripcionRepository.contarPorActividadYEstado(8L, EstadoInscripcion.ACTIVA)).thenReturn(15L);

        List<ActividadDto> lista = service.listarConCupo(null);

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).cupoDisponible()).isZero();
    }

    @Test
    void listarConCupoFiltraPorDisciplina() {
        when(actividadRepository.findByDisciplinaIgnoreCase("bienestar")).thenReturn(List.of(yoga));
        when(inscripcionRepository.contarPorActividadYEstado(8L, EstadoInscripcion.ACTIVA)).thenReturn(0L);

        assertThat(service.listarConCupo("bienestar")).hasSize(1);
        verify(actividadRepository, never()).findAll();
    }

    @Test
    void buscarPorIdFallaSiNoExiste() {
        when(actividadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void eliminarRechazaSiTieneInscriptosActivos() {
        when(actividadRepository.findById(8L)).thenReturn(Optional.of(yoga));
        when(inscripcionRepository.contarPorActividadYEstado(8L, EstadoInscripcion.ACTIVA)).thenReturn(2L);

        assertThatThrownBy(() -> service.eliminar(8L)).isInstanceOf(ReglaNegocioException.class);
        verify(actividadRepository, never()).delete(yoga);
    }

    @Test
    void eliminarBorraSiNoTieneInscriptosActivos() {
        when(actividadRepository.findById(8L)).thenReturn(Optional.of(yoga));
        when(inscripcionRepository.contarPorActividadYEstado(8L, EstadoInscripcion.ACTIVA)).thenReturn(0L);

        service.eliminar(8L);

        verify(actividadRepository).delete(yoga);
    }

    @Test
    void actualizarFallaSiNoExiste() {
        when(actividadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.actualizar(99L, new Actividad()))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }
}
