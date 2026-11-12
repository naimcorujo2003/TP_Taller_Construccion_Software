package ar.edu.siglo21.socioclub.controller;

import ar.edu.siglo21.socioclub.service.ActividadService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

// Controllers only talk to services, never to repositories
@Controller
public class OcupacionController {

    private final ActividadService actividadService;

    public OcupacionController(ActividadService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping("/ocupacion")
    public String panel(Model model) {
        model.addAttribute("panel", actividadService.panelOcupacion());
        return "ocupacion/panel";
    }
}
