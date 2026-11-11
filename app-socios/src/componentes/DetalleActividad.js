import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSocio } from '../contexto/ContextoSocio';
import { inscribirSocio, obtenerActividad, obtenerMensajeError } from '../servicios/api';
import '../estilos/DetalleActividad.css';

function DetalleActividad() {
  const { id } = useParams();
  const { socio } = useSocio();
  const [actividad, setActividad] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorInscripcion, setErrorInscripcion] = useState('');
  const [exito, setExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerActividad(id)
      .then(setActividad)
      .catch((e) => {
        if (e.response && e.response.status === 404) {
          setErrorCarga('La actividad no existe.');
        } else {
          setErrorCarga(obtenerMensajeError(e));
        }
      });
  }, [id]);

  const manejarInscripcion = async () => {
    setEnviando(true);
    setErrorInscripcion('');
    setExito(false); // drop the previous result so old and new messages never coexist
    try {
      await inscribirSocio(socio.id, actividad.id);
      setExito(true);
      // Refresh the activity so the available places are up to date
      setActividad(await obtenerActividad(id));
    } catch (e) {
      // 409 carries the business rule message in the "error" field
      setErrorInscripcion(obtenerMensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (errorCarga) {
    return <p className="mensaje mensaje--error" role="alert">{errorCarga}</p>;
  }
  if (!actividad) {
    return <p>Cargando actividad...</p>;
  }

  const sinCupo = actividad.cupoDisponible === 0;

  return (
    <section className={sinCupo ? 'detalle detalle--sin-cupo' : 'detalle'}>
      <h2>{actividad.nombre}</h2>
      <ul className="detalle__datos">
        <li>Disciplina: {actividad.disciplina}</li>
        <li>Profesor: {actividad.profesor}</li>
        <li>Días: {actividad.dias}</li>
        <li>Horario: {actividad.horario}</li>
        <li>
          Edades: {actividad.edadMinima} a {actividad.edadMaxima} años
        </li>
        <li>Cuota mensual: ${actividad.cuotaMensual}</li>
        <li>
          {sinCupo ? 'Sin cupo' : 'Cupo disponible: ' + actividad.cupoDisponible} (máximo{' '}
          {actividad.cupoMaximo})
        </li>
      </ul>

      {errorInscripcion && (
        <p className="mensaje mensaje--error" role="alert">{errorInscripcion}</p>
      )}
      {exito && (
        <p className="mensaje mensaje--exito" role="status">
          ¡Inscripción realizada! Mirá tus <Link to="/mis-actividades">actividades</Link>.
        </p>
      )}

      <div className="detalle__acciones">
        <button
          type="button"
          className="boton"
          disabled={sinCupo || enviando}
          onClick={manejarInscripcion}
        >
          Inscribirme
        </button>
        <Link to="/actividades">Volver al catálogo</Link>
      </div>
    </section>
  );
}

export default DetalleActividad;
