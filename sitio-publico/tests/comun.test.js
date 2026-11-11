const { cargarPagina } = require('./cargarPagina');

beforeEach(() => {
  cargarPagina('preinscripcion.html', 'comun.js', '/preinscripcion.html');
  // comun.js espera a DOMContentLoaded; en la prueba la página ya está cargada, así que lo disparamos
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

test('el botón "Volver" usa history.back() cuando hay historial', () => {
  window.history.pushState({}, '', '/preinscripcion.html#otro'); // ahora history.length > 1
  const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});

  document.querySelector('[data-accion="volver"]').click();

  expect(back).toHaveBeenCalled();
  back.mockRestore();
});
