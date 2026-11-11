import { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DetalleActividad from './DetalleActividad';
import { ProveedorSocio, useSocio } from '../contexto/ContextoSocio';
import * as api from '../servicios/api';

jest.mock('../servicios/api');
// CRA's Jest cannot resolve react-router-dom v7, so the router is replaced by a minimal stub
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  Link: ({ children }) => <a href="#">{children}</a>,
}));

const actividad = {
  id: 1,
  nombre: 'Fútbol infantil',
  disciplina: 'Fútbol',
  profesor: 'Diego Ferreyra',
  dias: 'Lun y Mié',
  horario: '18:00',
  edadMinima: 6,
  edadMaxima: 12,
  cupoMaximo: 40,
  cupoDisponible: 36,
  cuotaMensual: 18000,
};

// Logs a socio in through the context before rendering the screen
function IniciarSesion({ children }) {
  const { ingresar, socio } = useSocio();
  useEffect(() => {
    ingresar({ id: 7, nombre: 'Mateo', apellido: 'Gómez' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return socio ? children : null;
}

function renderizar() {
  return render(
    <ProveedorSocio>
      <IniciarSesion>
        <DetalleActividad />
      </IniciarSesion>
    </ProveedorSocio>
  );
}

describe('DetalleActividad', () => {
  beforeEach(() => {
    api.obtenerActividad.mockResolvedValue(actividad);
    api.obtenerMensajeError.mockImplementation((e) => e.message);
  });

  test('shows the business rule message and clears the previous success message', async () => {
    api.inscribirSocio
      .mockResolvedValueOnce({ id: 99 })
      .mockRejectedValueOnce(new Error('El socio ya está inscripto en esta actividad'));
    renderizar();

    const boton = await screen.findByRole('button', { name: 'Inscribirme' });
    fireEvent.click(boton);
    expect(await screen.findByText(/Inscripción realizada/)).toBeInTheDocument();

    fireEvent.click(boton);
    expect(await screen.findByText('El socio ya está inscripto en esta actividad')).toBeInTheDocument();
    expect(screen.queryByText(/Inscripción realizada/)).not.toBeInTheDocument();
  });
});
