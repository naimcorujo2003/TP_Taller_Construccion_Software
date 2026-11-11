const { cargarPagina } = require('./cargarPagina');

let Actividad;

beforeEach(() => {
  ({ Actividad } = cargarPagina('actividades.html', 'actividades.js'));
});

const nombresVisibles = () =>
  [...document.querySelectorAll('#lista-actividades article h3')].map((h) => h.textContent);

function cambiar(elemento, valor, evento) {
  elemento.value = valor;
  elemento.dispatchEvent(new Event(evento));
}

describe('clase Actividad', () => {
  let futbol;
  beforeEach(() => {
    futbol = new Actividad('Fútbol infantil', 'Fútbol', 'Lun y Mié', '18:00', 6, 12, 40, 18000, 'Diego Ferreyra');
  });

  test('esAptaParaEdad acepta los bordes del rango (6 y 12)', () => {
    expect(futbol.esAptaParaEdad(6)).toBe(true);
    expect(futbol.esAptaParaEdad(12)).toBe(true);
  });

  test('esAptaParaEdad rechaza edades fuera del rango (5 y 13)', () => {
    expect(futbol.esAptaParaEdad(5)).toBe(false);
    expect(futbol.esAptaParaEdad(13)).toBe(false);
  });

  test('cuotaFormateada usa el formato argentino', () => {
    expect(futbol.cuotaFormateada()).toBe('$ 18.000');
  });

  test('crearTarjeta arma un article con nombre, precio y enlace a la preinscripción', () => {
    const tarjeta = futbol.crearTarjeta();
    expect(tarjeta.tagName).toBe('ARTICLE');
    expect(tarjeta.querySelector('h3').textContent).toBe('Fútbol infantil');
    expect(tarjeta.querySelector('.precio').textContent).toBe('$ 18.000 / mes');
    expect(tarjeta.querySelector('a').getAttribute('href'))
      .toBe('preinscripcion.html?actividad=F%C3%BAtbol%20infantil');
    expect(tarjeta.dataset.publico).toBe('infantil');
  });
});

describe('catálogo en actividades.html', () => {
  test('al cargar muestra las 8 actividades del club', () => {
    expect(nombresVisibles()).toHaveLength(8);
    expect(document.getElementById('contador').textContent).toBe('(8 de 8)');
    expect(document.getElementById('sin-resultados').hidden).toBe(true);
  });

  test('el select de disciplinas se genera ordenado y sin repetidos', () => {
    const opciones = [...document.querySelectorAll('#filtro-disciplina option')].map((o) => o.value);
    expect(opciones).toEqual(['', 'Ajedrez', 'Básquet', 'Bienestar', 'Fitness', 'Fútbol', 'Natación', 'Patín', 'Vóley']);
  });

  test('filtrar por disciplina deja solo esa actividad', () => {
    cambiar(document.getElementById('filtro-disciplina'), 'Natación', 'change');
    expect(nombresVisibles()).toEqual(['Natación']);
  });

  test('filtrar por edad 14 saca Fútbol infantil (6 a 12) y deja las aptas', () => {
    cambiar(document.getElementById('filtro-edad'), '14', 'input');
    expect(nombresVisibles()).toEqual(['Vóley mixto', 'Básquet juvenil', 'Natación', 'Patín artístico', 'Ajedrez']);
  });

  test('si ningún filtro coincide muestra el aviso "No hay actividades"', () => {
    cambiar(document.getElementById('filtro-disciplina'), 'Fútbol', 'change');
    cambiar(document.getElementById('filtro-edad'), '14', 'input');
    expect(nombresVisibles()).toHaveLength(0);
    expect(document.getElementById('sin-resultados').hidden).toBe(false);
  });

  test('"Limpiar filtros" vuelve a mostrar todo', () => {
    cambiar(document.getElementById('filtro-edad'), '70', 'input');
    expect(nombresVisibles()).toEqual(['Natación', 'Ajedrez', 'Yoga']);

    document.getElementById('boton-limpiar').click();
    expect(nombresVisibles()).toHaveLength(8);
    expect(document.getElementById('filtro-edad').value).toBe('');
  });
});
