// Chequeos de la estructura HTML que pide la Parte A, sobre los archivos reales.
const fs = require('fs');
const path = require('path');

const paginas = ['index.html', 'actividades.html', 'preinscripcion.html'];

function cargar(pagina) {
  const html = fs.readFileSync(path.join(__dirname, '..', pagina), 'utf8');
  return new DOMParser().parseFromString(html, 'text/html');
}

describe.each(paginas)('%s', (pagina) => {
  let doc;
  beforeAll(() => {
    doc = cargar(pagina);
  });

  test('tiene meta viewport y lang="es"', () => {
    expect(doc.querySelector('meta[name="viewport"]')).not.toBeNull();
    expect(doc.documentElement.getAttribute('lang')).toBe('es');
  });

  test('usa header, nav, main y footer, y un único h1', () => {
    ['header', 'nav', 'main', 'footer'].forEach((etiqueta) => {
      expect(doc.querySelector(etiqueta)).not.toBeNull();
    });
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });

  test('enlaza la hoja estilos.css externa', () => {
    expect(doc.querySelector('link[rel="stylesheet"][href="css/estilos.css"]')).not.toBeNull();
  });

  test('todas las imágenes tienen texto alternativo', () => {
    doc.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });

  test('no repite IDs', () => {
    const ids = [...doc.querySelectorAll('[id]')].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('enlaza a las otras dos páginas y los archivos enlazados existen', () => {
    const hrefs = [...doc.querySelectorAll('nav a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(paginas));

    const locales = [...doc.querySelectorAll('link[href], script[src], img[src]')]
      .map((e) => e.getAttribute('href') || e.getAttribute('src'));
    locales.forEach((ruta) => {
      expect(fs.existsSync(path.join(__dirname, '..', ruta))).toBe(true);
    });
  });
});

test('index.html usa section y aside; actividades.html genera los article con JS', () => {
  const index = cargar('index.html');
  expect(index.querySelector('section')).not.toBeNull();
  expect(index.querySelector('aside')).not.toBeNull();
  // El catálogo no está escrito a mano: el contenedor viene vacío
  expect(cargar('actividades.html').querySelectorAll('#lista-actividades article')).toHaveLength(0);
});

test('estilos.css tiene selectores de tipo, clase, ID y atributo, y una media query', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
  expect(css).toMatch(/^body\s*\{/m);              // tipo
  expect(css).toMatch(/^\.tarjeta\s*\{/m);         // clase
  expect(css).toMatch(/^#filtros\s*\{/m);          // ID
  expect(css).toMatch(/\[type="email"\]/);         // atributo
  expect(css).toMatch(/@media \(max-width: 600px\)/);
});
