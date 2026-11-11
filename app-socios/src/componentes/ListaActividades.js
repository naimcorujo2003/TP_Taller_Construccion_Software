import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaActividad from './TarjetaActividad';
import { listarActividades, obtenerMensajeError } from '../servicios/api';
import '../estilos/ListaActividades.css';

function ListaActividades() {
  const [actividades, setActividades] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplina, setDisciplina] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const navegar = useNavigate();

  // Load the full catalog once to build the filter options
  useEffect(() => {
    listarActividades()
      .then((todas) => setDisciplinas([...new Set(todas.map((a) => a.disciplina))].sort()))
      .catch((e) => setError(obtenerMensajeError(e)));
  }, []);

  // Reload whenever the selected disciplina changes
  useEffect(() => {
    setCargando(true);
    listarActividades(disciplina)
      .then((datos) => {
        setActividades(datos);
        setError('');
      })
      .catch((e) => setError(obtenerMensajeError(e)))
      .finally(() => setCargando(false));
  }, [disciplina]);

  return (
    <section className="lista-actividades">
      <h2>Actividades</h2>
      <label htmlFor="filtro-disciplina">Filtrar por disciplina</label>
      <select
        id="filtro-disciplina"
        value={disciplina}
        onChange={(e) => setDisciplina(e.target.value)}
      >
        <option value="">Todas</option>
        {disciplinas.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {error && <p className="mensaje mensaje--error" role="alert">{error}</p>}
      {cargando && <p>Cargando actividades...</p>}
      {!cargando && !error && actividades.length === 0 && (
        <p className="mensaje mensaje--vacio">No hay actividades para esa disciplina.</p>
      )}

      <div className="lista-actividades__grilla">
        {actividades.map((actividad) => (
          <TarjetaActividad
            key={actividad.id}
            actividad={actividad}
            onVerDetalle={(id) => navegar('/actividades/' + id)}
          />
        ))}
      </div>
    </section>
  );
}

export default ListaActividades;
