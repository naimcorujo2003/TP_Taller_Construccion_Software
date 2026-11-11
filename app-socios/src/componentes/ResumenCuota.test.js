import { render, screen } from '@testing-library/react';
import ResumenCuota from './ResumenCuota';

describe('ResumenCuota', () => {
  test('shows the estimated fee with the discount applied', () => {
    const actividades = [{ cuotaMensual: 10000 }, { cuotaMensual: 5000 }];
    render(<ResumenCuota actividades={actividades} />);

    expect(screen.getByText(/13500/)).toBeInTheDocument();
    expect(screen.getByText(/10% de descuento/)).toBeInTheDocument();
  });
});
