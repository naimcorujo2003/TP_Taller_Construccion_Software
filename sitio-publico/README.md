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

## Requisitos de la materia y dónde están

- **HTML semántico**: `header`, `nav`, `main`, `section`, `article` (cada tarjeta, creada por JS), `aside` y `footer`.
- **Selectores CSS**: tipo (`body`, `h1`, `label`), clase (`.tarjeta`, `.boton`), ID (`#portada`, `#filtros`) y
  atributo (`.tarjeta[data-publico="infantil"]`, `input[type="email"]`, `a[target="_blank"]`).
- **Media queries**: `max-width: 900px` (2 columnas, aside abajo) y `max-width: 600px` (1 columna, menú debajo del logo).
- **Clase `Actividad`** con los métodos `esAptaParaEdad(edad)`, `esInfantil()`, `cuotaFormateada()` y `crearTarjeta()`.
- **Eventos con `addEventListener`**: `change` del select, `input` del campo edad, `click` de "Limpiar filtros",
  `submit` y `focusout` del formulario.
- **Objetos del navegador**: `history` (botón Volver) y `location` (el botón "Preinscribirme" de cada tarjeta abre
  `preinscripcion.html?actividad=Yoga` y el formulario lee `location.search` para preseleccionar la actividad).

## Flujo del filtro (para explicar en la defensa)

1. El usuario cambia el select o escribe una edad → se dispara el evento `change` / `input`.
2. El listener llama a `filtrar()`, que lee `selectDisciplina.value` e `inputEdad.value`.
3. `actividades.filter(...)` se queda con las que coinciden; la edad se chequea con `actividad.esAptaParaEdad(edad)`.
4. `mostrarActividades(lista)` vacía `#lista-actividades` y agrega un `article` por actividad con `crearTarjeta()`
   (`document.createElement` + `append`). Si la lista queda vacía se muestra el aviso "No hay actividades...".
