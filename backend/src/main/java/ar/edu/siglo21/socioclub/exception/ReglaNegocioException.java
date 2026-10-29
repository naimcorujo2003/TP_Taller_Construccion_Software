package ar.edu.siglo21.socioclub.exception;

/** A business rule (RN1..RN5, or another conflict) rejected the operation. Mapped to HTTP 409. */
public class ReglaNegocioException extends RuntimeException {

    private final String regla;

    public ReglaNegocioException(String regla, String mensaje) {
        super(mensaje);
        this.regla = regla;
    }

    public String getRegla() {
        return regla;
    }
}
