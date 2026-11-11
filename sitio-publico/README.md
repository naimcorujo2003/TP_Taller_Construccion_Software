# SocioClub - sitio público (Parte A)

HTML5 + CSS3 + JavaScript, sin frameworks ni servidor. Abrir `index.html` con doble clic.

| Archivo | Qué hay |
|---|---|
| `index.html` | Presentación del club, historia, ubicación y datos de secretaría (`aside`) |
| `actividades.html` | Catálogo generado con JS y filtros por disciplina y edad |
| `preinscripcion.html` | Formulario validado con JS (errores junto a cada campo, sin `alert`) |
| `css/estilos.css` | Hoja de estilos única |
| `js/actividades.js` | Clase `Actividad`, arreglo con las 8 actividades, filtro |
| `js/preinscripcion.js` | Validación (RN7: DNI de 7 u 8 dígitos sin puntos) |
| `js/comun.js` | Botón "Volver" con `history.back()` |

## Pruebas automáticas

El sitio no necesita Node para funcionar; Node se usa **solo** para correr las pruebas con Jest y jsdom
(un navegador simulado que carga las páginas reales y ejecuta sus scripts).

```bash
cd sitio-publico
npm install
npm test
```

| Archivo | Qué prueba |
|---|---|
| `tests/actividades.test.js` | Clase `Actividad` (bordes de edad, formato de cuota, tarjeta) y el filtro por disciplina/edad sobre el DOM |
| `tests/preinscripcion.test.js` | `esDniValido` (RN7: puntos, letras, 6 y 9 dígitos), errores junto a cada campo, que no use `alert`, mensaje de éxito y preselección por `location.search` |
| `tests/comun.test.js` | El botón "Volver" llama a `history.back()` |
| `tests/estructura.test.js` | Las 3 páginas: `meta viewport`, etiquetas semánticas, `alt` en imágenes, IDs únicos, enlaces y archivos existentes, selectores CSS pedidos |

Para que Jest pueda usar las funciones, al final de `actividades.js` y `preinscripcion.js` hay un
`if (typeof module !== 'undefined') module.exports = ...`. En el navegador `module` no existe y esa línea no hace nada.

## Requisitos de la materia y dónde están

- **HTML semántico**: `header`, `nav`, `main`, `section`, `article` (cada tarjeta, creada por JS), `aside` y `footer`.
- **Selectores CSS**: tipo (`body`, `h1`, `label`), clase (`.tarjeta`, `.boton`, `.panel`), ID (`#filtros`,
  `#form-preinscripcion`, `#lista-actividades`) y atributo (`.pastilla[aria-pressed="true"]` para la disciplina elegida,
  `input[aria-invalid="true"]` para los campos con error, `a[target="_blank"]`).
- **Media queries**: `max-width: 1024px` (2 columnas de tarjetas), `max-width: 820px` (el `aside` pasa arriba del
  contenido) y `max-width: 600px` (1 columna, menú debajo del logo, botones a todo el ancho).
- **Clase `Actividad`** con los métodos `esAptaParaEdad(edad)`, `esInfantil()`, `cuotaFormateada()` y `crearTarjeta()`.
  Los íconos de la tarjeta se crean con `document.createElementNS` (los SVG necesitan su propio namespace).
- **Eventos con `addEventListener`**: `click` en el contenedor de pastillas (delegación de eventos: un solo listener
  atiende todos los botones), `input` del campo edad, `submit` y `focusout` del formulario.
- **Objetos del navegador**: `history` (botón Volver) y `location` (el botón "Preinscribirme" de cada tarjeta abre
  `preinscripcion.html?actividad=Yoga` y el formulario lee `location.search` para preseleccionar la actividad).
- **Tipografía**: Plus Jakarta Sans desde Google Fonts; si no hay internet se usa la fuente del sistema.

## Flujo del filtro (para explicar en la defensa)

1. El usuario toca una pastilla de disciplina o escribe una edad → se dispara `click` (en el contenedor `#filtro-disciplina`)
   o `input` (en `#filtro-edad`).
2. En el `click`, `evento.target.closest('.pastilla')` encuentra el botón tocado; se guarda su `data-disciplina` en
   `disciplinaElegida` y se marca con `aria-pressed="true"` (el CSS lo pinta de verde por ese atributo).
3. `filtrar()` lee `disciplinaElegida` e `inputEdad.value`; `actividades.filter(...)` se queda con las que coinciden y la
   edad se chequea con `actividad.esAptaParaEdad(edad)`.
4. `mostrarActividades(lista)` vacía `#lista-actividades` y agrega un `article` por actividad con `crearTarjeta()`
   (`document.createElement` + `append`). Si la lista queda vacía se muestra el aviso "No hay actividades...".
