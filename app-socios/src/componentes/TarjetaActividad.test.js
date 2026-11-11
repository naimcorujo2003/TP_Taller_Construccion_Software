import { render, screen, fireEvent } from '@testing-library/react';
import TarjetaActividad from './TarjetaActividad';

const actividadConCupo = {
  id: 1,
  nombre: 'Natación',
  disciplina: 'Natación',
  profesor: 'Ana Pérez',
  dias: 'Lun y Mié',
  horario: '18:00',
  cuotaMensual: 12000,
  cupoDisponible: 5,
};

describe('TarjetaActividad', () => {
  test('shows the activity name and the available places', () => {
    render(<TarjetaActividad actividad={actividadConCupo} onVerDetalle={() => {}} />);

    expect(screen.getByText('Natación', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText(/Cupo disponible: 5/)).toBeInTheDocument();
    expect(screen.queryByText('Sin cupo')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inscribirme/i })).toBeEnabled();
  });

  test('with no places left shows "Sin cupo" and disables the button', () => {
    const llena = { ...actividadConCupo, cupoDisponible: 0 };
    render(<TarjetaActividad actividad={llena} onVerDetalle={() => {}} />);

    expect(screen.getByText('Sin cupo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inscribirme/i })).toBeDisabled();
  });

  test('clicking the button calls onVerDetalle with the activity id', () => {
    const manejarVer = jest.fn();
    render(<TarjetaActividad actividad={actividadConCupo} onVerDetalle={manejarVer} />);

    fireEvent.click(screen.getByRole('button', { name: /inscribirme/i }));

    expect(manejarVer).toHaveBeenCalledWith(1);
  });

  test('with no places left the card gets the grey modifier class and the click does nothing', () => {
    const manejarVer = jest.fn();
    const llena = { ...actividadConCupo, cupoDisponible: 0 };
    const { container } = render(<TarjetaActividad actividad={llena} onVerDetalle={manejarVer} />);

    expect(container.firstChild).toHaveClass('tarjeta--sin-cupo');
    fireEvent.click(screen.getByRole('button', { name: /inscribirme/i }));
    expect(manejarVer).not.toHaveBeenCalled();
  });
});
