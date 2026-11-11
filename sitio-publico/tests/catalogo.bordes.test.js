// Casos borde del catálogo y pruebas de integración entre páginas y con los datos del backend.
const fs = require('fs');
const path = require('path');
const { cargarPagina } = require('./cargarPagina');

const nombresVisibles = () =>
  [...document.querySelectorAll('#lista-actividades article h3')].map((h) => h.textContent);

const pastilla = (texto) =>
  [...document.querySelectorAll('#filtro-disciplina .pastilla')].find((b) => b.textContent === texto);

function escribirEdad(valor) {
  const input = document.getElementById('filtro-edad');
  input.value = valor;
  input.dispatchEvent(new Event('input'));
}

let modulo;
beforeEach(() => {
  modulo = cargarPagina('actividades.html', 'actividades.js');
});

describe('filtro de edad con valores raros', () => {
  test.each(['0', '-5'])('con edad %s no muestra actividades y avisa', (edad) => {
    escribirEdad(edad);
    expect(nombresVisibles()).toHaveLength(0);
    expect(document.getElementById('sin-resultados').hidden).toBe(false);
  });

  test('con edad 150 no hay actividades (la máxima es 99)', () => {
    escribirEdad('150');
    expect(nombresVisibles()).toHaveLength(0);
  });

  test.each([
    ['5', ['Natación', 'Patín artístico']],
    ['99', ['Ajedrez', 'Yoga']],
    ['17', ['Vóley mixto', 'Básquet juvenil', 'Natación', 'Ajedrez', 'Yoga']],
    ['18', ['Vóley mixto', 'Natación', 'Ajedrez', 'Funcional adultos', 'Yoga']],
  ])('bordes de los rangos: con %s años muestra %j', (edad, esperadas) => {
    escribirEdad(edad);
    expect(nombresVisibles()).toEqual(esperadas);
  });

  test('al sacar el aviso de "sin resultados" vuelve a mostrarse el catálogo', () => {
    escribirEdad('0');
    escribirEdad('10');
    expect(document.getElementById('sin-resultados').hidden).toBe(true);
    expect(nombresVisibles().length).toBeGreaterThan(0);
  });
});

describe('pastillas', () => {
  test('siempre hay exactamente una pastilla marcada', () => {
    ['Vóley', 'Ajedrez', 'Todas', 'Bienestar'].forEach((texto) => {
      pastilla(texto).click();
      const marcadas = document.querySelectorAll('.pastilla[aria-pressed="true"]');
      expect(marcadas).toHaveLength(1);
      expect(marcadas[0].textContent).toBe(texto);
    });
  });

  test('tocar dos veces la misma pastilla no cambia el resultado', () => {
    pastilla('Vóley').click();
    pastilla('Vóley').click();
    expect(nombresVisibles()).toEqual(['Vóley mixto']);
  });

  test('un clic en el espacio entre pastillas no cambia el filtro', () => {
    pastilla('Vóley').click();
    document.getElementById('filtro-disciplina').click();
    expect(nombresVisibles()).toEqual(['Vóley mixto']);
  });

  test('cambiar la disciplina no borra la edad escrita', () => {
    escribirEdad('10');
    pastilla('Natación').click();
    pastilla('Todas').click();
    expect(document.getElementById('filtro-edad').value).toBe('10');
    expect(nombresVisibles()).toEqual(['Fútbol infantil', 'Natación', 'Patín artístico', 'Ajedrez']);
  });

  test('las pastillas son botones type="button" (no envían nada si quedan dentro de un form)', () => {
    document.querySelectorAll('.pastilla').forEach((boton) => {
      expect(boton.tagName).toBe('BUTTON');
      expect(boton.type).toBe('button');
    });
  });

  test('filtrar muchas veces no duplica tarjetas', () => {
    for (let i = 0; i < 20; i++) {
      pastilla(i % 2 ? 'Todas' : 'Fútbol').click();
    }
    expect(nombresVisibles()).toHaveLength(8);
  });
});

describe('seguridad de las tarjetas', () => {
  test('un nombre con HTML se muestra como texto, no como código', () => {
    const rara = new modulo.Actividad('<b>Truco</b>', 'Otro', 'Lun', '10:00', 1, 99, 5, 1000, '<i>x</i>');
    const tarjeta = rara.crearTarjeta();
    expect(tarjeta.querySelector('b')).toBeNull();
    expect(tarjeta.querySelector('h3').textContent).toBe('<b>Truco</b>');
  });
});

describe('integración entre páginas', () => {
  test('el botón "Preinscribirme" de cada tarjeta preselecciona esa actividad en el formulario', () => {
    const enlaces = [...document.querySelectorAll('#lista-actividades a.boton')].map((a) => a.getAttribute('href'));
    expect(enlaces).toHaveLength(8);

    enlaces.forEach((href, i) => {
      cargarPagina('preinscripcion.html', 'preinscripcion.js', '/' + href);
      const elegida = document.getElementById('form-preinscripcion').elements.actividad.value;
      expect(elegida).toBe(modulo.actividades[i].nombre);
    });
  });

  test('las opciones del formulario coinciden con el catálogo (nombre y rango de edad)', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'preinscripcion.html'), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const opciones = [...doc.querySelectorAll('#actividad option')].filter((o) => o.value !== '');

    expect(opciones.map((o) => o.value)).toEqual(modulo.actividades.map((a) => a.nombre));
    opciones.forEach((opcion, i) => {
      const a = modulo.actividades[i];
      expect(opcion.textContent).toBe(`${a.nombre} (${a.edadMinima} a ${a.edadMaxima} años)`);
      // El rango que usa la validación del formulario tiene que ser el mismo del catálogo
      expect(Number(opcion.dataset.edadMin)).toBe(a.edadMinima);
      expect(Number(opcion.dataset.edadMax)).toBe(a.edadMaxima);
    });
  });

  test('el catálogo del sitio coincide con los datos que carga el backend (data.sql)', () => {
    const ruta = path.join(__dirname, '..', '..', 'backend', 'src', 'main', 'resources', 'data.sql');
    if (!fs.existsSync(ruta)) {
      return; // el sitio se puede probar solo, sin la carpeta del backend
    }
    const sql = fs.readFileSync(ruta, 'utf8');
    const filas = [...sql.matchAll(/\('([^']+)', '([^']+)', '([^']+)', '([^']+)', (\d+), (\d+), (\d+), ([\d.]+), '([^']+)'\)/g)];
    expect(filas).toHaveLength(8);

    filas.forEach((f, i) => {
      const a = modulo.actividades[i];
      expect([a.nombre, a.disciplina, a.dias, a.horario, a.edadMinima, a.edadMaxima, a.cupoMaximo, a.cuotaMensual, a.profesor])
        .toEqual([f[1], f[2], f[3], f[4], Number(f[5]), Number(f[6]), Number(f[7]), Number(f[8]), f[9]]);
    });
  });
});

describe('accesibilidad de las tres páginas', () => {
  test.each(['index.html', 'actividades.html', 'preinscripcion.html'])('%s: cada campo tiene su <label>', (pagina) => {
    const html = fs.readFileSync(path.join(__dirname, '..', pagina), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('input, select, textarea').forEach((control) => {
      expect(doc.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    });
  });

  test.each(['index.html', 'actividades.html', 'preinscripcion.html'])('%s: los íconos decorativos se ocultan a lectores de pantalla', (pagina) => {
    const html = fs.readFileSync(path.join(__dirname, '..', pagina), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('svg').forEach((svg) => {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });
  });

  test('los enlaces que abren otra pestaña usan rel="noopener"', () => {
    ['index.html', 'actividades.html', 'preinscripcion.html'].forEach((pagina) => {
      const html = fs.readFileSync(path.join(__dirname, '..', pagina), 'utf8');
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.querySelectorAll('a[target="_blank"]').forEach((a) => {
        expect(a.getAttribute('rel')).toContain('noopener');
      });
    });
  });
});
