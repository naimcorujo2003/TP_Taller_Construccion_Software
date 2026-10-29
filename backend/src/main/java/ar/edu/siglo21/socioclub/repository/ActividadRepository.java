package ar.edu.siglo21.socioclub.repository;

import ar.edu.siglo21.socioclub.model.Actividad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    List<Actividad> findByDisciplinaIgnoreCase(String disciplina);
}
