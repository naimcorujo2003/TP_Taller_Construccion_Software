import { NavLink, useNavigate } from 'react-router-dom';
import { useSocio } from '../contexto/ContextoSocio';
import '../estilos/Encabezado.css';

function Encabezado() {
  const { socio, salir } = useSocio();
  const navegar = useNavigate();

  const manejarSalida = () => {
    salir();
    navegar('/');
  };

  return (
    <header className="encabezado">
      <h1 className="encabezado__titulo">Mi Club</h1>
      {socio && (
        <nav className="encabezado__nav">
          <NavLink to="/actividades">Actividades</NavLink>
          <NavLink to="/mis-actividades">Mis actividades</NavLink>
          <span className="encabezado__socio">
            {socio.nombre} {socio.apellido}
          </span>
          <button type="button" className="boton boton--secundario" onClick={manejarSalida}>
            Salir
          </button>
        </nav>
      )}
    </header>
  );
}

export default Encabezado;
