package ar.edu.siglo21.socioclub.exception;

/** The requested socio, actividad or inscripcion does not exist. Mapped to HTTP 404. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
