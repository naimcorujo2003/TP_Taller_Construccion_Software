import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ContextoSocio = createContext(null);

const CLAVE_ALMACENAMIENTO = 'socioclub.socio';

// Storage can throw (disabled/blocked) and the JSON can be corrupt: fall back to no session.
function leerSocioGuardado() {
  try {
    const crudo = window.sessionStorage.getItem(CLAVE_ALMACENAMIENTO);
    return crudo ? JSON.parse(crudo) : null;
  } catch (error) {
    return null;
  }
}

function guardarSocio(socio) {
  try {
    if (socio) {
      window.sessionStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(socio));
    } else {
      window.sessionStorage.removeItem(CLAVE_ALMACENAMIENTO);
    }
  } catch (error) {
    // Persistence is best-effort; the in-memory state still works.
  }
}

// Holds the logged-in socio so every screen can read it without prop drilling.
// The socio survives a page refresh through sessionStorage (cleared when the tab closes).
export function ProveedorSocio({ children }) {
  const [socio, setSocio] = useState(leerSocioGuardado);

  const ingresar = (nuevoSocio) => {
    guardarSocio(nuevoSocio);
    setSocio(nuevoSocio);
  };
  const salir = () => {
    guardarSocio(null);
    setSocio(null);
  };

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
