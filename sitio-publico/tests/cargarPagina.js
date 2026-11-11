// Ayuda para las pruebas: carga una página HTML real del sitio en el DOM de jsdom
// y después ejecuta su script, igual que haría el navegador.
const fs = require('fs');
const path = require('path');

function cargarPagina(archivoHtml, archivoScript, url) {
  const html = fs.readFileSync(path.join(__dirname, '..', archivoHtml), 'utf8');
  document.documentElement.innerHTML = html; // los <script> no se ejecutan con innerHTML

  if (url) {
    window.history.replaceState({}, '', url);
  }

  let modulo;
  jest.isolateModules(() => {
    modulo = require(path.join('..', 'js', archivoScript));
  });
  return modulo;
}

module.exports = { cargarPagina };
