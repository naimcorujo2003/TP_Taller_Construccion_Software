import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocio } from '../contexto/ContextoSocio';
import {
  darDeBajaInscripcion,
  listarInscripcionesDeSocio,
  obtenerMensajeError,
} from '../servicios/api';
import ResumenCuota from './ResumenCuota';
import '../estilos/MisActividades.css';

function MisActividades() {
  const { socio } = useSocio();
  const [inscripciones, setInscripciones] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setInscripciones(await listarInscripcionesDeSocio(socio.id));
      setError('');
    } catch (e) {
      setError(obtenerMensajeError(e));
    } finally {
      setCargando(false);
    }
  }, [socio.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const manejarBaja = async (inscripcionId) => {
    try {
      await darDeBajaInscripcion(inscripcionId);
      await cargar();
    } catch (e) {
      setError(obtenerMensajeError(e));
    }
  };

  return (
    <section className="mis-actividades">
      <h2>Mis actividades</h2>
      {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {!cargando && inscripciones.length === 0 && (
        <p className="mensaje mensaje--vacio">
          Todavía no estás inscripto en ninguna actividad. <Link to="/actividades">Ver actividades</Link>
        </p>
      )}

      <ul className="mis-actividades__lista">
        {inscripciones.map((inscripcion) => (
          <li key={inscripcion.id} className="mis-actividades__item">
            <div>
              <strong>{inscripcion.actividadNombre}</strong>
              <p>
                {inscripcion.dias} - {inscripcion.horario}
              </p>
              <p>Cuota mensual: ${inscripcion.cuotaMensual}</p>
            </div>
            <button
              type="button"
              className="boton"
              onClick={() => manejarBaja(inscripcion.id)}
            >
              Darme de baja
            </button>
          </li>
        ))}
      </ul>

      {inscripciones.length > 0 && <ResumenCuota actividades={inscripciones} />}
    </section>
  );
}

export default MisActividades;
