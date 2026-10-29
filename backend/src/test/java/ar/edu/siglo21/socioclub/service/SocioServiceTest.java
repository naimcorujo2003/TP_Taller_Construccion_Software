package ar.edu.siglo21.socioclub.service;

import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Socio;
import ar.edu.siglo21.socioclub.repository.SocioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocioServiceTest {

    @Mock
    SocioRepository socioRepository;
    @InjectMocks
    SocioService service;

    Pageable pagina = PageRequest.of(0, 10);

    @Test
    void buscarSinApellidoListaTodos() {
        when(socioRepository.findAll(pagina)).thenReturn(new PageImpl<>(List.of(new Socio())));

        assertThat(service.buscar("  ", pagina).getContent()).hasSize(1);
        verify(socioRepository, never()).findByApellidoContainingIgnoreCase("  ", pagina);
    }

    @Test
    void buscarConApellidoUsaElFiltro() {
        when(socioRepository.findByApellidoContainingIgnoreCase("per", pagina))
                .thenReturn(new PageImpl<>(List.of(new Socio())));

        assertThat(service.buscar(" per ", pagina).getContent()).hasSize(1);
    }

    @Test
    void buscarPorDniFallaSiNoExiste() {
        when(socioRepository.findByDni("1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorDni("1")).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void crearRechazaDniDuplicado() {
        Socio socio = new Socio();
        socio.setDni("30111222");
        when(socioRepository.existsByDni("30111222")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(socio)).isInstanceOf(ReglaNegocioException.class);
        verify(socioRepository, never()).save(socio);
    }

    @Test
    void actualizarCopiaLosDatosEnElSocioExistente() {
        Socio existente = new Socio();
        existente.setId(1L);
        existente.setDni("30111222");
        Socio datos = new Socio();
        datos.setDni("30111222");
        datos.setNombre("Ana");
        when(socioRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(socioRepository.save(existente)).thenReturn(existente);

        assertThat(service.actualizar(1L, datos).getNombre()).isEqualTo("Ana");
    }
}
