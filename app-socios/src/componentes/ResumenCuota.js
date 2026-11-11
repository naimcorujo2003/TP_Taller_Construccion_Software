import PropTypes from 'prop-types';
import calcularCuotaMensual from '../utils/calcularCuotaMensual';
import '../estilos/ResumenCuota.css';

const TEXTO_DESCUENTO = { 2: '10% de descuento por 2 actividades', 3: '15% de descuento por 3 actividades' };

function ResumenCuota({ actividades }) {
  const total = calcularCuotaMensual(actividades);

  return (
    <aside className="resumen-cuota">
      <h3>Cuota mensual estimada</h3>
      <p className="resumen-cuota__total">${total}</p>
      {TEXTO_DESCUENTO[actividades.length] && (
        <p className="resumen-cuota__descuento">{TEXTO_DESCUENTO[actividades.length]}</p>
      )}
    </aside>
  );
}

ResumenCuota.propTypes = {
  actividades: PropTypes.arrayOf(
    PropTypes.shape({
      cuotaMensual: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
};

export default ResumenCuota;
