# SocioClub - backend (Partes B y C)

Spring Boot 4 + Spring MVC + Thymeleaf + Spring Data JPA + MySQL. Un solo proyecto con dos "caras" que usan **la misma capa de servicio**:

- Backoffice de secretaría (Thymeleaf): `http://localhost:8080/actividades`, `/socios`, `/inscripciones/nueva`.
- API REST (Anexo A): `http://localhost:8080/api/...`

## Requisitos

- Java 17 y Maven (o `./mvnw`)
- Docker (solo para levantar MySQL)

## Cómo levantar todo

```bash
cd backend
docker compose up -d          # MySQL 8 en localhost:3306 (espera a que quede "healthy")
mvn spring-boot:run           # la app crea las tablas y carga data.sql
```

Credenciales por defecto (las mismas que `docker-compose.yml`): base `socioclub`, usuario `socioclub`, clave `socioclub`.
Se pueden cambiar con las variables de entorno `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`.

Cada vez que arranca la app las tablas se **recrean** (`spring.jpa.hibernate.ddl-auto=create`) y se vuelven a cargar los datos
de `src/main/resources/data.sql`, así todos los grupos trabajan sobre los mismos datos. Para frenar:

```bash
docker compose down           # agregar -v para borrar también el volumen
```

El archivo `database/socioclub.sql` (en la raíz del repo) tiene el script de creación y los mismos datos iniciales para
cargarlos a mano en MySQL (`mysql -uroot -p < database/socioclub.sql`). La app no lo necesita.

## Tests

```bash
cd backend
mvn test
```

No necesitan MySQL: los tests usan una base H2 en memoria que está **solo en scope test** (`src/test/resources/application.properties`).

- `service/`: pruebas unitarias con Mockito de RN1 a RN5 (incluye bordes de edad y la baja lógica).
- `repository/`: consultas derivadas y `@Query`.
- `controller/` y `api/`: páginas Thymeleaf y endpoints del Anexo A con MockMvc.

## Datos de prueba (DNIs reales de `data.sql`)

| Para probar | Socio | DNI |
|---|---|---|
| Inscripción exitosa (8 años, sin actividades) | Mateo Gómez | `40111001` |
| Chico de 5 años (RN3 en Fútbol infantil, 6 a 12) | Tomás Acosta | `40111005` |
| Chica de 14 años (RN3 en Fútbol infantil) | Camila Ledesma | `40222001` |
| **Moroso** (RN4) | Nicolás Peralta | `37333008` |
| **Moroso** (RN4) | Mónica Aguirre | `27333009` |
| **Ya tiene 3 actividades** (RN5) | Laura Fernández | `28333001` |
| Ya inscripta en Fútbol infantil (RN2) | Sofía Díaz | `40111002` |
| Socio libre para llenar el último lugar de Ajedrez | Sabrina Quiroga | `39333015` |

Actividades con cupo especial: **Yoga** (id 8) está llena, 15 de 15 (RN1); **Ajedrez** (id 6) tiene 15 de 16, queda un lugar.
Hay 24 socios, así que el listado de socios muestra 3 páginas de 10.

## Endpoints (Anexo A)

| Verbo | Ruta | Respuestas |
|---|---|---|
| GET | `/api/actividades` (`?disciplina=Fútbol`) | 200 |
| GET | `/api/actividades/{id}` | 200 / 404 |
| POST | `/api/actividades` | 201 / 400 |
| PUT | `/api/actividades/{id}` | 200 / 400 / 404 |
| DELETE | `/api/actividades/{id}` | 204 / 404 / 409 |
| GET | `/api/socios/dni/{dni}` | 200 / 404 |
| GET | `/api/socios/{id}/inscripciones` | 200 / 404 |
| POST | `/api/inscripciones` `{"socioId":3,"actividadId":1}` | 201 / 400 / 404 / 409 |
| PUT | `/api/inscripciones/{id}/baja` | 200 / 404 |

Cuando una regla rechaza la operación la respuesta es 409:

```json
{ "error": "La actividad no tiene cupo disponible", "regla": "RN1" }
```

CORS permite las peticiones de `http://localhost:3000` (la app React).

## Postman

Importar `postman/SocioClub.postman_collection.json`. Tiene todos los endpoints con casos de éxito y de error (RN1 a RN5,
404, 400 y el 409 al borrar una actividad con inscriptos). Cada request describe el status esperado y trae un test
(`pm.test`) que lo verifica. Con la app recién iniciada, correr las carpetas de arriba hacia abajo (Runner). La variable
`baseUrl` apunta a `http://localhost:8080`.

## Estructura (paquetes `ar.edu.siglo21.socioclub`)

| Paquete | Qué hay |
|---|---|
| `model` | Entidades JPA `Socio`, `Actividad`, `Inscripcion` y los enums |
| `repository` | Interfaces Spring Data JPA |
| `service` | Reglas de negocio (`InscripcionService` aplica RN1 a RN5) |
| `controller` | Controladores MVC (Thymeleaf). Solo llaman a servicios |
| `api` | Controladores REST (`@RestController`) y el manejo de errores HTTP |
| `dto` | Registros que se devuelven por JSON |
| `exception` | `ReglaNegocioException` (409) y `RecursoNoEncontradoException` (404) |
| `config` | `Clock` y CORS |

## Cosas para poder explicar en la defensa

- **Orden de las reglas** en `InscripcionService.inscribir`: RN4 (moroso), RN2 (duplicado), RN5 (máximo 3), RN3 (edad), RN1 (cupo).
  Primero se validan las reglas baratas del socio y al final la que cuenta inscripciones de la actividad.
- **Ciclo JSON**: `Socio` tiene una lista de `Inscripcion` y cada `Inscripcion` apunta a su `Socio`; serializar la entidad
  entraría en un bucle infinito. Por eso la API devuelve DTOs planos (`InscripcionDto`, `SocioDto`, `ActividadDto`).
- **Baja lógica**: `darDeBaja` solo cambia el estado a `BAJA`; esa inscripción deja de contar para el cupo y para el máximo de 3.
- **Edad**: se calcula con `Period.between(nacimiento, hoy)`, que cuenta años cumplidos (si el cumpleaños es mañana todavía no suma).
  "Hoy" viene de un bean `Clock`, así los tests fijan la fecha.
- **Relaciones LAZY y `open-in-view=false`**: los controladores no pueden recorrer relaciones perezosas fuera del servicio;
  las consultas que necesitan el socio o la actividad los traen con `join fetch` / `@EntityGraph`.
- **Concurrencia**: el control de cupo cuenta y luego inserta; dos pedidos simultáneos para el último lugar podrían pasar los dos.
  Para este TP se acepta; en producción habría que bloquear la actividad o usar una restricción en la base.
