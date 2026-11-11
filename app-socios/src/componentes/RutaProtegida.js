import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSocio } from '../contexto/ContextoSocio';

// Redirects to the login screen when nobody has logged in yet.
function RutaProtegida({ children }) {
  const { socio } = useSocio();
  if (!socio) {
    return <Navigate to="/" replace />;
  }
  return children;
}

RutaProtegida.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RutaProtegida;
