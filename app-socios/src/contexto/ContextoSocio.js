import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ContextoSocio = createContext(null);

// Holds the logged-in socio so every screen can read it without prop drilling.
export function ProveedorSocio({ children }) {
  const [socio, setSocio] = useState(null);

  const ingresar = (nuevoSocio) => setSocio(nuevoSocio);
  const salir = () => setSocio(null);

  return (
    <ContextoSocio.Provider value={{ socio, ingresar, salir }}>
      {children}
    </ContextoSocio.Provider>
  );
}

ProveedorSocio.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSocio() {
  const valor = useContext(ContextoSocio);
  if (valor === null) {
    throw new Error('useSocio must be used inside ProveedorSocio');
  }
  return valor;
}
