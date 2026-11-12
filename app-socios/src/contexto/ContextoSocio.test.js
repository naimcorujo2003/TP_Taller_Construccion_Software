import { render, screen, fireEvent } from '@testing-library/react';
import { ProveedorSocio, useSocio } from './ContextoSocio';

const CLAVE = 'socioclub.socio';
const socioEjemplo = { id: 1, nombre: 'Ana', apellido: 'Gomez', dni: '12345678' };

function Sonda() {
  const { socio, ingresar, salir } = useSocio();
  return (
    <div>
      <span data-testid="nombre">{socio ? socio.nombre : 'nadie'}</span>
      <button onClick={() => ingresar(socioEjemplo)}>ingresar</button>
      <button onClick={salir}>salir</button>
    </div>
  );
}

function montar() {
  return render(
    <ProveedorSocio>
      <Sonda />
    </ProveedorSocio>
  );
}

describe('ContextoSocio persistence', () => {
  beforeEach(() => window.sessionStorage.clear());

  test('restores the persisted socio on mount', () => {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(socioEjemplo));
    montar();
    expect(screen.getByTestId('nombre')).toHaveTextContent('Ana');
  });

  test('ingresar stores the socio and salir clears it', () => {
    montar();
    fireEvent.click(screen.getByText('ingresar'));
    expect(JSON.parse(window.sessionStorage.getItem(CLAVE))).toEqual(socioEjemplo);
    fireEvent.click(screen.getByText('salir'));
    expect(window.sessionStorage.getItem(CLAVE)).toBeNull();
    expect(screen.getByTestId('nombre')).toHaveTextContent('nadie');
  });

  test('corrupt JSON in storage does not crash and yields no socio', () => {
    window.sessionStorage.setItem(CLAVE, '{not json');
    montar();
    expect(screen.getByTestId('nombre')).toHaveTextContent('nadie');
  });
});
