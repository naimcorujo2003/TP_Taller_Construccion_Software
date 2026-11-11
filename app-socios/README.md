# Mi Club - app React para socios (Parte D)

App creada con create-react-app. Consume la API REST del backend (`../backend`) usando Axios; todas las llamadas
están en `src/servicios/api.js`.

## Cómo correrla

1. Levantar el backend (ver `../backend/README.md`): MySQL con `docker compose up -d` y `mvn spring-boot:run`.
2. En esta carpeta:

```bash
npm install
npm start          # http://localhost:3000
```

### URL de la API

Por defecto usa `http://localhost:8080/api`. Si el backend corre en otro puerto (por ejemplo `SERVER_PORT=8081`):

```bash
REACT_APP_API_URL=http://localhost:8081/api npm start
```

También se puede guardar en un archivo `.env.local` (ver `.env.example`). El backend permite CORS solo desde
`http://localhost:3000`.

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Ingreso por DNI (valida 7 u 8 dígitos y busca el socio en la API) |
| `/actividades` | Catálogo con filtro por disciplina y cupo disponible |
| `/actividades/:id` | Detalle de la actividad y botón "Inscribirme" (muestra el mensaje 409 de la API) |
| `/mis-actividades` | Inscripciones activas, "Darme de baja" y cuota mensual estimada (RN6) |

## Pruebas

```bash
npm test -- --watchAll=false
npm run build
```

Jest + React Testing Library; no necesitan el backend.

- `src/utils`: `calcularCuotaMensual` (RN6) y `esDniValido` (RN7).
- `src/componentes`: `TarjetaActividad` y `ResumenCuota`.

## DNIs de prueba (datos de `data.sql`)

| Para probar | Socio | DNI |
|---|---|---|
| Inscripción exitosa | Mateo Gómez | `40111001` |
| Chico de 5 años (RN3 en Fútbol infantil) | Tomás Acosta | `40111005` |
| Chica de 14 años (RN3 en Fútbol infantil) | Camila Ledesma | `40222001` |
| Moroso (RN4) | Nicolás Peralta | `37333008` |
| Moroso (RN4) | Mónica Aguirre | `27333009` |
| Ya tiene 3 actividades (RN5) | Laura Fernández | `28333001` |
| Ya inscripta en Fútbol infantil (RN2) | Sofía Díaz | `40111002` |
| Para llenar el último lugar de Ajedrez | Sabrina Quiroga | `39333015` |

Yoga (id 8) está llena (RN1); Ajedrez (id 6) tiene un lugar libre.
