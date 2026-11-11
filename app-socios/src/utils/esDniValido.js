// RN7: a valid DNI is a string of exactly 7 or 8 digits (no dots, no letters).
function esDniValido(dni) {
  return typeof dni === 'string' && /^\d{7,8}$/.test(dni);
}

export default esDniValido;
