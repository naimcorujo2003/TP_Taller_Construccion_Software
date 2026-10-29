package ar.edu.siglo21.socioclub.api;

import ar.edu.siglo21.socioclub.dto.InscripcionDto;
import ar.edu.siglo21.socioclub.dto.SocioDto;
import ar.edu.siglo21.socioclub.service.InscripcionService;
import ar.edu.siglo21.socioclub.service.SocioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/socios")
public class SocioRestController {

    private final SocioService socioService;
    private final InscripcionService inscripcionService;

    public SocioRestController(SocioService socioService, InscripcionService inscripcionService) {
        this.socioService = socioService;
        this.inscripcionService = inscripcionService;
    }

    @GetMapping("/dni/{dni}")
    public SocioDto buscarPorDni(@PathVariable String dni) {
        return SocioDto.from(socioService.buscarPorDni(dni));
    }

    @GetMapping("/{id}/inscripciones")
    public List<InscripcionDto> inscripcionesActivas(@PathVariable Long id) {
        return inscripcionService.listarActivasDeSocio(id).stream().map(InscripcionDto::from).toList();
    }
}
