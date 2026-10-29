package ar.edu.siglo21.socioclub.api;

import ar.edu.siglo21.socioclub.dto.InscripcionDto;
import ar.edu.siglo21.socioclub.dto.InscripcionRequest;
import ar.edu.siglo21.socioclub.model.Inscripcion;
import ar.edu.siglo21.socioclub.service.InscripcionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inscripciones")
public class InscripcionRestController {

    private final InscripcionService inscripcionService;

    public InscripcionRestController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    // Same service method the Thymeleaf form calls, so RN1..RN5 apply identically
    @PostMapping
    public ResponseEntity<InscripcionDto> inscribir(@Valid @RequestBody InscripcionRequest request) {
        Inscripcion inscripcion = inscripcionService.inscribir(request.socioId(), request.actividadId());
        return ResponseEntity.status(HttpStatus.CREATED).body(InscripcionDto.from(inscripcion));
    }

    @PutMapping("/{id}/baja")
    public InscripcionDto darDeBaja(@PathVariable Long id) {
        return InscripcionDto.from(inscripcionService.darDeBaja(id));
    }
}
