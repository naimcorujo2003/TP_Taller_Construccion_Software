# SocioClub

Trabajo Práctico Integrador — Taller de Construcción de Software, Universidad Siglo 21.

Sistema web de gestión de socios, actividades e inscripciones para el Club Social y Deportivo Los Algarrobos (Córdoba).
Tres "caras" comparten una sola base de datos MySQL y un solo backend Spring Boot.

## Integrantes

| Integrante | Parte a cargo |
|---|---|
| Naim Corujo | Backend: Partes B y C |
| Santiago Perez | Sitio público: Parte A |
| Benjamín Armitano Carol | _completar_ |
| Demian Giaiprone | _completar_ |
| _completar_ | _completar_ |

Grupo N.º: _completar_

## Estructura del repositorio

| Carpeta | Contenido | Parte | Estado |
|---|---|---|---|
| [`/sitio-publico`](sitio-publico) | HTML5, CSS3 y JavaScript: sitio público del club | A | Listo |
| [`/backend`](backend) | Spring Boot + Thymeleaf + JPA + API REST | B y C | Listo |
| [`/app-socios`](app-socios) | App React "Mi Club" para socios | D y E | Listo |
| [`/database`](database) | `socioclub.sql`: creación de tablas y datos iniciales | — | Listo |

## Arquitectura

```
[ Navegador del vecino ]   [ Navegador de Marta ]   [ Celular del socio ]
  Sitio público (A)          Vistas Thymeleaf (B)     App React "Mi Club" (D)
                                     |                       | Axios (JSON)
                                     v                       v
                +-----------------------------------------------------+
                |        BACKEND SPRING BOOT (un solo proyecto)       |
                |  Controladores MVC (B)      Controladores REST (C)  |
                |  Capa de SERVICIO      (reglas RN1 a RN5)           |
                |  Capa de REPOSITORIO   (Spring Data JPA)            |
                |  Capa de MODELO        (entidades JPA)              |
                +--------------------------+--------------------------+
                                           v
                                  [ Base de datos MySQL ]
```

Los controladores MVC y los REST usan **la misma capa de servicio**: una inscripción se valida igual venga de la secretaría o de la app del socio.

## Requisitos

- Java 17
- Maven (o el `./mvnw` incluido en `backend/`)
- Docker (solo para levantar MySQL)
- Node.js y npm (para el sitio público y la app React)

## Cómo levantar el proyecto

### 1. Base de datos

```bash
cd backend
docker compose up -d      # MySQL 8 en localhost:3306
```

Base `socioclub`, usuario `socioclub`, clave `socioclub`. Si no se usa Docker, se puede cargar a mano `database/socioclub.sql` en un MySQL propio y ajustar las variables `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_PASSWORD`.

### 2. Backend (puerto 8080)

```bash
cd backend
mvn spring-boot:run
```

Al arrancar crea las tablas y carga los datos iniciales (las 8 actividades del club y los socios de prueba). Cada arranque **recrea** las tablas.

- Backoffice de secretaría: <http://localhost:8080/actividades>
- Panel de ocupación (extra): <http://localhost:8080/ocupacion>
- API REST: <http://localhost:8080/api/actividades>

### 3. Sitio público

Abrir `sitio-publico/index.html` en el navegador (no necesita servidor). Es un sitio estático: el catálogo sale de un arreglo de objetos en JavaScript y el formulario de preinscripción solo se valida en el cliente (no se conecta al backend). Detalles en [`sitio-publico/README.md`](sitio-publico/README.md).

### 4. App React "Mi Club" (puerto 3000)

```bash
cd app-socios
npm install
npm start
```

Por defecto la app llama a `http://localhost:8080/api`. Si el backend corre en otro puerto (por ejemplo `SERVER_PORT=8081`), arrancarla con `REACT_APP_API_URL=http://localhost:8081/api npm start`. El backend permite CORS para `http://localhost:3000`. Más detalles en [`app-socios/README.md`](app-socios/README.md).

## Atajo con Docker (opcional)

Alternativa para levantar todo el sistema (MySQL, backend, app React y sitio público) con un solo comando desde la raíz del repositorio. Los pasos manuales de arriba siguen siendo válidos y son el método principal.

```bash
docker compose up --build
```

La primera vez tarda unos minutos porque construye las imágenes. Después:

| Servicio | URL |
|---|---|
| App React "Mi Club" | http://localhost:3000 |
| API del backend | http://localhost:8080/api |
| Vista web del backend | http://localhost:8080/actividades |
| Sitio público | http://localhost:8090 |

- Si el puerto 8080 está ocupado (por ejemplo por Docker Desktop), usar otro: `BACKEND_PORT=8081 docker compose up --build`. La app se compila apuntando a ese puerto.
- La app React queda siempre en el puerto 3000, porque el backend solo permite CORS para `http://localhost:3000`.
- Para detener y borrar también la base de datos: `docker compose down -v`.
- No ejecutarlo junto con el `docker compose` manual de `backend/` (comparten el nombre del volumen y el puerto 3306 de la base).

## Usuarios (DNI) de prueba

La app de socios ingresa solo con el DNI.

| Para probar | Socio | DNI |
|---|---|---|
| Inscripción exitosa | Mateo Gómez | `40111001` |
| Edad fuera de rango (RN3) | Tomás Acosta (5 años) | `40111005` |
| Moroso (RN4) | Nicolás Peralta | `37333008` |
| Ya tiene 3 actividades (RN5) | Laura Fernández | `28333001` |
| Ya inscripta en Fútbol infantil (RN2) | Sofía Díaz | `40111002` |

Yoga está llena (15/15) para probar la regla de cupo (RN1). La lista completa de datos está en [`backend/README.md`](backend/README.md).

## Pruebas

| Qué | Cómo |
|---|---|
| Backend (JUnit + Mockito + MockMvc, sin MySQL) | `cd backend && mvn test` |
| API (Postman) | Importar `backend/postman/SocioClub.postman_collection.json` |
| Sitio público (Jest + jsdom) | `cd sitio-publico && npm install && npm test` |
| Jest + React Testing Library | `cd app-socios && npm test` |
| Pruebas de sistema (6 casos, RN1 a RN5) | Ver [`docs/pruebas-de-sistema.md`](docs/pruebas-de-sistema.md) |

## Documentación

- [`backend/README.md`](backend/README.md): endpoints (Anexo A), datos de prueba, estructura de paquetes y puntos clave para la defensa.
- [`docs/informe-tecnico.md`](docs/informe-tecnico.md) y [`docs/bitacora-ia.md`](docs/bitacora-ia.md): borradores del informe y de la bitácora de IA (se completan y se entregan en PDF).
- Informe técnico en PDF y bitácora de uso de IA: se entregan por el aula virtual como `TPI_SocioClub_GrupoN.pdf`.
