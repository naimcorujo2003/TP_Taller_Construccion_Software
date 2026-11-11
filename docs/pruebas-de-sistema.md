# Pruebas de sistema

Pruebas de extremo a extremo ejecutadas el 11/11/2026 contra el sistema completo: MySQL 8, backend Spring Boot en el puerto 8081 y app React en el puerto 3000. Los datos de partida son los de `database/socioclub.sql`.

## Casos de prueba

| N.º | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 | Inscripción exitosa y baja | 1. Ingresar con el DNI 40111001 (Mateo Gómez). 2. Abrir Fútbol infantil e inscribirse. 3. Ir a "Mis actividades". 4. Usar "Darme de baja". | Mensaje de éxito, cupo ocupado +1, la actividad figura en "Mis actividades" con su cuota estimada. Tras la baja, mensaje de lista vacía y el cupo vuelve al valor inicial. API: 201. | OK. Se mostró "Inscripción realizada" y el cupo pasó a 36/40. En "Mis actividades" apareció la actividad con cuota estimada de $18000. Tras "Darme de baja" se mostró el mensaje de lista vacía y el cupo volvió a 37. La API respondió 201. |
| 2 | RN2: inscripción duplicada | Con el mismo socio, inscribirse otra vez en Fútbol infantil. | 409 con el mensaje de la regla RN2. | OK. 409: "El socio ya está inscripto en esta actividad". |
| 3 | RN1: actividad sin cupo | Ingresar con Sabrina Quiroga (DNI 39333015, id 24) e inscribirse en Yoga (15/15). | 409 con el mensaje de la regla RN1. | OK. 409: "La actividad no tiene cupo disponible". |
| 4 | RN3: edad fuera de rango | Ingresar con Tomás Acosta (DNI 40111005, 5 años) e inscribirse en Vóley mixto. | 409 con el mensaje de la regla RN3. | OK. 409: "La edad del socio no está dentro del rango permitido (13 a 60 años)". |
| 5 | RN4: socio moroso | Ingresar con Nicolás Peralta (DNI 37333008, MOROSO) e inscribirse en Fútbol infantil. | 409 con el mensaje de la regla RN4. | OK. 409: "Debe regularizar su cuota en secretaría". |
| 6 | RN5: máximo de actividades | Ingresar con Laura Fernández (DNI 28333001, 3 actividades activas) e inscribirse en Vóley mixto. | 409 con el mensaje de la regla RN5. | OK. 409: "Alcanzó el máximo de 3 actividades". |

En los casos 2 a 6 la app muestra el mensaje devuelto por la API en pantalla.

## Pruebas automatizadas

| Alcance | Herramienta | Resultado |
|---|---|---|
| Backend (servicio, repositorios, controladores MVC y REST) | `mvn test` (JUnit, Mockito, MockMvc) | 72 pruebas en verde |
| API REST | Colección Postman `backend/postman/SocioClub.postman_collection.json` | 26/26 correctas (ejecución de una sesión anterior) |
| Sitio público | Jest + jsdom | 99 pruebas en verde |
| App React (`app-socios`) | Jest + React Testing Library | 19 pruebas en verde: 13 de utilidades, más las de `ResumenCuota`, `TarjetaActividad` y `DetalleActividad` |

## CORS

Se verificó que el backend acepta las peticiones del origen `http://localhost:3000` (app React), tal como lo usaron los casos de la tabla anterior.
