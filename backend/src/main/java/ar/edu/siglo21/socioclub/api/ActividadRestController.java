package ar.edu.siglo21.socioclub.api;

import ar.edu.siglo21.socioclub.dto.ActividadDto;
import ar.edu.siglo21.socioclub.dto.ActividadRequest;
import ar.edu.siglo21.socioclub.model.Actividad;
import ar.edu.siglo21.socioclub.service.ActividadService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadRestController {

    private final ActividadService actividadService;

    public ActividadRestController(ActividadService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping
    public List<ActividadDto> listar(@RequestParam(required = false) String disciplina) {
        return actividadService.listarConCupo(disciplina);
    }

    @GetMapping("/{id}")
    public ActividadDto detalle(@PathVariable Long id) {
        return actividadService.detalleConCupo(id);
    }

    @PostMapping
    public ResponseEntity<ActividadDto> crear(@Valid @RequestBody ActividadRequest request) {
        Actividad creada = actividadService.crear(request.toEntity());
        return ResponseEntity.created(URI.create("/api/actividades/" + creada.getId()))
                .body(actividadService.detalleConCupo(creada.getId()));
    }

    @PutMapping("/{id}")
    public ActividadDto actualizar(@PathVariable Long id, @Valid @RequestBody ActividadRequest request) {
        actividadService.actualizar(id, request.toEntity());
        return actividadService.detalleConCupo(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        actividadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
