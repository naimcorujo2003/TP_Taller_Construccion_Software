# Bitácora de uso de IA

> Borrador generado con asistencia de IA: cada integrante debe revisarlo, reescribirlo con sus palabras y poder defender cada entrada.

Formato del Anexo (N.º, Parte, qué le pedimos a la IA, qué nos devolvió, qué estaba mal y qué cambiamos y por qué). Las entradas corresponden a hechos ocurridos durante el desarrollo.

| N.º | Parte | Qué le pedimos a la IA (resumen del prompt) | Qué nos devolvió | Qué estaba mal / qué cambiamos y por qué |
|---|---|---|---|---|
| 1 | B | Generar la estructura inicial del proyecto Spring Boot con Spring Initializr. | Un `pom.xml` cuyo parent usaba la versión `4.1.2.RELEASE`. | Esa versión no existe en Maven Central y el proyecto no resolvía dependencias. Se corrigió a `4.1.2`, que es la versión publicada. |
| 2 | B | Cargar datos de prueba para poder demostrar las cinco reglas de inscripción. | Un conjunto de actividades y socios de prueba. | Hacía falta una actividad llena para mostrar RN1. Se ajustó Yoga para que quede con 15 de 15 lugares ocupados, de modo que inscribirse en ella dispare el rechazo por cupo. |
| 3 | A | Revisar el sitio público como si tuviera que integrarse con el backend. | Una revisión que marcaba como faltante la conexión del sitio con la API. | Error de interpretación: el grupo volvió a leer el enunciado y la Parte A es estática por diseño (catálogo en JavaScript y formulario validado solo en el cliente). Se corrigió la revisión y no se agregó ninguna integración. |
| 4 | D | Probar en vivo la pantalla de detalle de actividad inscribiéndose y repitiendo la inscripción. | La pantalla funcionaba, pero tras el error de RN2 seguía visible el mensaje de éxito de la inscripción anterior junto al mensaje de error. | Estado obsoleto en la pantalla. Se reprodujo con una prueba de Jest que fallaba y se corrigió reiniciando el indicador de éxito antes de cada intento, con lo que la prueba pasó a verde. |
| 5 | E | Escribir las pruebas de Jest de la app React creada con create-react-app. | Pruebas de componentes que importaban `react-router-dom` v7. | Jest de create-react-app no pudo resolver ese módulo. En la prueba se reemplazó el router por un doble (stub), sin cambiar el código de la app. |
| 6 | E | Elegir socios de prueba para los casos de sistema de RN1 y RN5. | Socios que no servían para esos casos: uno con edad fuera de rango para Yoga y otro ya inscripto en la actividad. | Los casos fallaban por una regla distinta a la que se quería demostrar. Se corrigió leyendo los datos iniciales: Sabrina Quiroga (DNI 39333015) para RN1 en Yoga y Laura Fernández (DNI 28333001, con 3 actividades activas) para RN5 en Vóley mixto. |

Observación para la revisión del grupo: la entrada 1 y la 2 se corresponden con la Parte B, la 3 con la Parte A, y las entradas 4 a 6 con las Partes D y E. Verificar la asignación de parte y completar con las entradas propias de cada integrante que no figuren aquí.
