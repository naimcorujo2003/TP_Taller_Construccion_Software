import esDniValido from './esDniValido';

describe('esDniValido (RN7)', () => {
  test('accepts 8 digits', () => {
    expect(esDniValido('40111001')).toBe(true);
  });

  test('accepts 7 digits', () => {
    expect(esDniValido('7123456')).toBe(true);
  });

  test('rejects dots', () => {
    expect(esDniValido('40.111.001')).toBe(false);
  });

  test('rejects letters', () => {
    expect(esDniValido('4011100A')).toBe(false);
  });

  test('rejects 6 digits', () => {
    expect(esDniValido('401110')).toBe(false);
  });

  test('rejects 9 digits', () => {
    expect(esDniValido('401110011')).toBe(false);
  });

  test('rejects empty and non-string values', () => {
    expect(esDniValido('')).toBe(false);
    expect(esDniValido(40111001)).toBe(false);
  });
});
