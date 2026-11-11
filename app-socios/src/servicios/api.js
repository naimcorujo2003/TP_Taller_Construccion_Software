import axios from 'axios';

// Base URL is configurable so it works with any backend port (e.g. SERVER_PORT=8081).
const URL_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const cliente = axios.create({ baseURL: URL_BASE });

// Returns the rule message sent by the backend (409 body: { error, regla }) or a generic fallback.
export function obtenerMensajeError(error) {
  const datos = error && error.response && error.response.data;
  if (datos && datos.error) {
    return datos.error;
  }
  if (error && error.response) {
    return 'Ocurrió un error inesperado (código ' + error.response.status + ').';
  }
  return 'No se pudo conectar con el servidor.';
}

export async function buscarSocioPorDni(dni) {
  const respuesta = await cliente.get('/socios/dni/' + dni);
  return respuesta.data;
}

export async function listarActividades(disciplina) {
  const params = disciplina ? { disciplina } : {};
  const respuesta = await cliente.get('/actividades', { params });
  return respuesta.data;
}

export async function obtenerActividad(id) {
  const respuesta = await cliente.get('/actividades/' + id);
  return respuesta.data;
}

export async function listarInscripcionesDeSocio(socioId) {
  const respuesta = await cliente.get('/socios/' + socioId + '/inscripciones');
  return respuesta.data;
}

export async function inscribirSocio(socioId, actividadId) {
  const respuesta = await cliente.post('/inscripciones', { socioId, actividadId });
  return respuesta.data;
}

export async function darDeBajaInscripcion(inscripcionId) {
  const respuesta = await cliente.put('/inscripciones/' + inscripcionId + '/baja');
  return respuesta.data;
}
