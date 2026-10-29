package ar.edu.siglo21.socioclub.repository;

import ar.edu.siglo21.socioclub.model.Socio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocioRepository extends JpaRepository<Socio, Long> {

    // Spring builds: select ... from socio where dni = ?
    Optional<Socio> findByDni(String dni);

    boolean existsByDni(String dni);

    // Spring builds: where upper(apellido) like upper('%?%'), plus limit/offset from the Pageable
    Page<Socio> findByApellidoContainingIgnoreCase(String apellido, Pageable pageable);
}
