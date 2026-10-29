package ar.edu.siglo21.socioclub.controller;

import ar.edu.siglo21.socioclub.exception.RecursoNoEncontradoException;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Error page for the Thymeleaf screens only (the REST API has its own handler in the api package). */
@ControllerAdvice(basePackages = "ar.edu.siglo21.socioclub.controller")
public class MvcExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String noEncontrado(RecursoNoEncontradoException e, Model model) {
        model.addAttribute("mensaje", e.getMessage());
        return "error/404";
    }
}
