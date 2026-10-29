package ar.edu.siglo21.socioclub.controller;

import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Inscripcion;
import ar.edu.siglo21.socioclub.service.ActividadService;
import ar.edu.siglo21.socioclub.service.InscripcionService;
import ar.edu.siglo21.socioclub.service.SocioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/inscripciones")
public class InscripcionController {

    private final InscripcionService inscripcionService;
    private final SocioService socioService;
    private final ActividadService actividadService;

    public InscripcionController(InscripcionService inscripcionService, SocioService socioService,
                                 ActividadService actividadService) {
        this.inscripcionService = inscripcionService;
        this.socioService = socioService;
        this.actividadService = actividadService;
    }

    @GetMapping("/nueva")
    public String nueva(@RequestParam(required = false) Long actividadId, Model model) {
        model.addAttribute("actividadId", actividadId);
        return formulario(model);
    }

    @PostMapping
    public String inscribir(@RequestParam Long socioId, @RequestParam Long actividadId,
                            Model model, RedirectAttributes flash) {
        try {
            inscripcionService.inscribir(socioId, actividadId);
        } catch (ReglaNegocioException e) {
            // Show the rule message on the same form, keeping the user's selection
            model.addAttribute("error", e.getMessage());
            model.addAttribute("socioId", socioId);
            model.addAttribute("actividadId", actividadId);
            return formulario(model);
        }
        flash.addFlashAttribute("ok", "Inscripción registrada");
        return "redirect:/actividades/" + actividadId + "/inscriptos";
    }

    @PostMapping("/{id}/baja")
    public String darDeBaja(@PathVariable Long id, RedirectAttributes flash) {
        Inscripcion inscripcion = inscripcionService.darDeBaja(id);
        flash.addFlashAttribute("ok", "Inscripción dada de baja");
        return "redirect:/actividades/" + inscripcion.getActividad().getId() + "/inscriptos";
    }

    private String formulario(Model model) {
        model.addAttribute("socios", socioService.listarTodos());
        model.addAttribute("actividades", actividadService.listarConCupo(null));
        return "inscripciones/form";
    }
}
