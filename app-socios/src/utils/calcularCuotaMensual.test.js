import calcularCuotaMensual from './calcularCuotaMensual';

const actividad = (cuotaMensual) => ({ cuotaMensual });

describe('calcularCuotaMensual (RN6)', () => {
  test('returns 0 with no activities', () => {
    expect(calcularCuotaMensual([])).toBe(0);
  });

  test('returns the full fee with one activity', () => {
    expect(calcularCuotaMensual([actividad(10000)])).toBe(10000);
  });

  test('applies 10% off with two activities', () => {
    expect(calcularCuotaMensual([actividad(10000), actividad(5000)])).toBe(13500);
  });

  test('applies 15% off with three activities', () => {
    expect(calcularCuotaMensual([actividad(10000), actividad(10000), actividad(10000)])).toBe(25500);
  });

  test('accepts fees as numeric strings', () => {
    expect(calcularCuotaMensual([actividad('8000.00')])).toBe(8000);
  });

  test('returns 0 when the argument is not a list', () => {
    expect(calcularCuotaMensual(undefined)).toBe(0);
  });
});
