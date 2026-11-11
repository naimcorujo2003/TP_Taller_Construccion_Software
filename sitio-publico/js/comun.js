// Código común a las tres páginas.
// Usa el objeto del navegador "history" (Lectura 4) para el botón "Volver".

document.addEventListener('DOMContentLoaded', function () {
  const botonesVolver = document.querySelectorAll('[data-accion="volver"]');

  botonesVolver.forEach(function (boton) {
    boton.addEventListener('click', function () {
      // Si el usuario llegó desde otra página del sitio, volvemos a ella.
      // Si abrió esta página directamente (no hay historial), lo mandamos al inicio.
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  });
});
