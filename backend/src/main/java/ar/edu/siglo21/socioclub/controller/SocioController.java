package ar.edu.siglo21.socioclub.controller;

import ar.edu.siglo21.socioclub.exception.ReglaNegocioException;
import ar.edu.siglo21.socioclub.model.EstadoCuota;
import ar.edu.siglo21.socioclub.model.Socio;
import ar.edu.siglo21.socioclub.service.SocioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/socios")
public class SocioController {

    private static final int TAMANIO_PAGINA = 10;

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    @GetMapping
    public String listar(@RequestParam(defaultValue = "") String apellido,
                         @RequestParam(defaultValue = "0") int page, Model model) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), TAMANIO_PAGINA, Sort.by("apellido", "nombre"));
        Page<Socio> pagina = socioService.buscar(apellido, pageable);
        model.addAttribute("pagina", pagina);
        model.addAttribute("apellido", apellido);
        return "socios/lista";
    }

    @GetMapping("/nuevo")
    public String nuevo(Model model) {
        model.addAttribute("socio", new Socio());
        return formulario(model, "/socios", "Nuevo socio");
    }

    @PostMapping
    public String crear(@Valid @ModelAttribute("socio") Socio socio, BindingResult resultado,
                        Model model, RedirectAttributes flash) {
        return guardar(null, socio, resultado, model, flash);
    }

    @GetMapping("/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("socio", socioService.buscarPorId(id));
        return formulario(model, "/socios/" + id, "Editar socio");
    }

    @PostMapping("/{id}")
    public String actualizar(@PathVariable Long id, @Valid @ModelAttribute("socio") Socio socio,
                             BindingResult resultado, Model model, RedirectAttributes flash) {
        return guardar(id, socio, resultado, model, flash);
    }

    private String guardar(Long id, Socio socio, BindingResult resultado, Model model, RedirectAttributes flash) {
        if (!resultado.hasErrors()) {
            try {
                if (id == null) {
                    socioService.crear(socio);
                } else {
                    socioService.actualizar(id, socio);
                }
                flash.addFlashAttribute("ok", "Socio guardado");
                return "redirect:/socios";
            } catch (ReglaNegocioException e) {
                resultado.rejectValue("dni", "duplicado", e.getMessage());
            }
        }
        return formulario(model, id == null ? "/socios" : "/socios/" + id, id == null ? "Nuevo socio" : "Editar socio");
    }

    private String formulario(Model model, String accion, String titulo) {
        model.addAttribute("accion", accion);
        model.addAttribute("titulo", titulo);
        model.addAttribute("estados", EstadoCuota.values());
        return "socios/form";
    }
}
