package ar.edu.siglo21.socioclub.repository;

import ar.edu.siglo21.socioclub.model.EstadoInscripcion;
import ar.edu.siglo21.socioclub.model.Inscripcion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    // The entity graph loads the activity in the same query (relations are LAZY)
    @EntityGraph(attributePaths = "actividad")
    List<Inscripcion> findBySocioIdAndEstado(Long socioId, EstadoInscripcion estado);

    boolean existsBySocioIdAndActividadIdAndEstado(Long socioId, Long actividadId, EstadoInscripcion estado);

    @Query("select count(i) from Inscripcion i where i.actividad.id = :actividadId and i.estado = :estado")
    long contarPorActividadYEstado(@Param("actividadId") Long actividadId, @Param("estado") EstadoInscripcion estado);

    @Query("select count(i) from Inscripcion i where i.socio.id = :socioId and i.estado = :estado")
    long contarPorSocioYEstado(@Param("socioId") Long socioId, @Param("estado") EstadoInscripcion estado);

    @Query("select i from Inscripcion i join fetch i.socio s "
            + "where i.actividad.id = :actividadId and i.estado = :estado order by s.apellido, s.nombre")
    List<Inscripcion> findInscriptosPorActividad(@Param("actividadId") Long actividadId,
                                                 @Param("estado") EstadoInscripcion estado);
}
