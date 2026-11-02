// ===== Direcciones de la API =====
// Servidor de la API (también sirve los archivos subidos en /uploads)
const API_ORIGEN = 'http://localhost:5001';
const API_URL = `${API_ORIGEN}/api`;

const API = {
    USUARIOS: `${API_URL}/usuarios`,
    GUIAS: `${API_URL}/guias`,
    JUEGOS: `${API_URL}/juegos`,
    COMENTARIOS: `${API_URL}/comentarios`,
    REPORTES: `${API_URL}/reportes`,
    MODERACION: `${API_URL}/moderacion`,
    ADMIN: `${API_URL}/admin`,
    CURSOS: `${API_URL}/cursos`,
    ROLES: `${API_URL}/roles`
};
