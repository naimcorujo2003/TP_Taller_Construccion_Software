import PropTypes from 'prop-types';
import '../estilos/TarjetaActividad.css';

function TarjetaActividad({ actividad, onVerDetalle }) {
  const sinCupo = actividad.cupoDisponible === 0;
  // Dynamic class: the stylesheet greys the card out when there are no places left
  const clase = sinCupo ? 'tarjeta tarjeta--sin-cupo' : 'tarjeta';

  return (
    <article className={clase}>
      <h3 className="tarjeta__nombre">{actividad.nombre}</h3>
      <p className="tarjeta__dato">Disciplina: {actividad.disciplina}</p>
      <p className="tarjeta__dato">
        {actividad.dias} - {actividad.horario}
      </p>
      <p className="tarjeta__dato">Cuota mensual: ${actividad.cuotaMensual}</p>
      {sinCupo ? (
        <p className="tarjeta__etiqueta">Sin cupo</p>
      ) : (
        <p className="tarjeta__dato">Cupo disponible: {actividad.cupoDisponible}</p>
      )}
      <button
        type="button"
        className="boton"
        disabled={sinCupo}
        onClick={() => onVerDetalle(actividad.id)}
      >
        Inscribirme
      </button>
    </article>
  );
}

TarjetaActividad.propTypes = {
  actividad: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    disciplina: PropTypes.string,
    dias: PropTypes.string,
    horario: PropTypes.string,
    cuotaMensual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cupoDisponible: PropTypes.number.isRequired,
  }).isRequired,
  onVerDetalle: PropTypes.func.isRequired,
};

export default TarjetaActividad;
