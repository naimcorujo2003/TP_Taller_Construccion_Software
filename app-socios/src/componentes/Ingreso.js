import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocio } from '../contexto/ContextoSocio';
import { buscarSocioPorDni, obtenerMensajeError } from '../servicios/api';
import esDniValido from '../utils/esDniValido';
import '../estilos/Ingreso.css';

function Ingreso() {
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { ingresar } = useSocio();
  const navegar = useNavigate();

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    const dniLimpio = dni.trim();
    if (!esDniValido(dniLimpio)) {
      setError('El DNI debe tener 7 u 8 dígitos, sin puntos ni letras.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const socio = await buscarSocioPorDni(dniLimpio);
      ingresar(socio);
      navegar('/actividades');
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setError('No existe un socio con ese DNI.');
      } else {
        setError(obtenerMensajeError(e));
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="ingreso">
      <h2>Ingresá con tu DNI</h2>
      <form onSubmit={manejarEnvio} className="ingreso__formulario">
        <label htmlFor="dni">DNI</label>
        <input
          id="dni"
          type="text"
          inputMode="numeric"
          placeholder="Ej: 40111001"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
        {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
        <button type="submit" className="boton" disabled={cargando}>
          {cargando ? 'Buscando...' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}

export default Ingreso;
