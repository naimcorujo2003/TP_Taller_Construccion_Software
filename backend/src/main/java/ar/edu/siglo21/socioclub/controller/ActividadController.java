package ar.edu.siglo21.socioclub.controller;

import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.Actividad;
import ar.edu.siglo21.socioclub.service.ActividadService;
import ar.edu.siglo21.socioclub.service.InscripcionService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// Controllers only talk to services, never to repositories
@Controller
@RequestMapping("/actividades")
public class ActividadController {

    private final ActividadService actividadService;
    private final InscripcionService inscripcionService;

    public ActividadController(ActividadService actividadService, InscripcionService inscripcionService) {
        this.actividadService = actividadService;
        this.inscripcionService = inscripcionService;
    }

    @GetMapping
    public String listar(@RequestParam(required = false) String disciplina, Model model) {
        model.addAttribute("actividades", actividadService.listarConCupo(disciplina));
        model.addAttribute("disciplina", disciplina);
        return "actividades/lista";
    }

    @GetMapping("/nueva")
    public String nueva(Model model) {
        model.addAttribute("actividad", new Actividad());
        model.addAttribute("accion", "/actividades");
        model.addAttribute("titulo", "Nueva actividad");
        return "actividades/form";
    }

    @PostMapping
    public String crear(@Valid @ModelAttribute("actividad") Actividad actividad, BindingResult resultado,
                        Model model, RedirectAttributes flash) {
        return guardar(null, actividad, resultado, model, flash, "Nueva actividad");
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("actividad", actividadService.buscarPorId(id));
        model.addAttribute("accion", "/actividades/" + id);
        model.addAttribute("titulo", "Editar actividad");
        return "actividades/form";
    }

    @PostMapping("/{id}")
    public String actualizar(@PathVariable Long id, @Valid @ModelAttribute("actividad") Actividad actividad,
                             BindingResult resultado, Model model, RedirectAttributes flash) {
        return guardar(id, actividad, resultado, model, flash, "Editar actividad");
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id, RedirectAttributes flash) {
        try {
            actividadService.eliminar(id);
            flash.addFlashAttribute("ok", "Actividad eliminada");
        } catch (ReglaNegocioException e) {
            flash.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/actividades";
    }

    @GetMapping("/{id}/inscriptos")
    public String inscriptos(@PathVariable Long id, Model model) {
        model.addAttribute("actividad", actividadService.detalleConCupo(id));
        model.addAttribute("inscripciones", inscripcionService.listarInscriptos(id));
        return "actividades/inscriptos";
    }

    private String guardar(Long id, Actividad actividad, BindingResult resultado, Model model,
                           RedirectAttributes flash, String titulo) {
        String accion = id == null ? "/actividades" : "/actividades/" + id;
        if (!resultado.hasErrors()) {
            try {
                if (id == null) {
                    actividadService.crear(actividad);
                } else {
                    actividadService.actualizar(id, actividad);
                }
                flash.addFlashAttribute("ok", "Actividad guardada");
                return "redirect:/actividades";
            } catch (ReglaNegocioException e) {
                resultado.reject("regla", e.getMessage());
            }
        }
        model.addAttribute("accion", accion);
        model.addAttribute("titulo", titulo);
        return "actividades/form";
    }
}
