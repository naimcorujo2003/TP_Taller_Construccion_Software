// RN6: monthly fee = sum of fees, 10% off with 2 active activities, 15% off with 3.
const DESCUENTO_POR_CANTIDAD = { 2: 0.1, 3: 0.15 };

function calcularCuotaMensual(actividades) {
  if (!Array.isArray(actividades) || actividades.length === 0) {
    return 0;
  }
  const subtotal = actividades.reduce((suma, a) => suma + Number(a.cuotaMensual), 0);
  const descuento = DESCUENTO_POR_CANTIDAD[actividades.length] || 0;
  // Round to cents to avoid floating point noise
  return Math.round(subtotal * (1 - descuento) * 100) / 100;
}

export default calcularCuotaMensual;
