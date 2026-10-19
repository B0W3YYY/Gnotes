// ===== Sesión y roles (SCRUM-18) =====
const API_URL = 'http://localhost:5001';

const ROLES = ['visitante', 'usuario', 'moderador', 'admin'];

function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem('sesion'));
    } catch (error) {
        return null;
    }
}

function guardarSesion(sesion) {
    localStorage.setItem('sesion', JSON.stringify(sesion));
}

function cerrarSesion() {
    localStorage.removeItem('sesion');
    window.location.href = obtenerBase() + 'index.html';
}

function obtenerRol() {
    const sesion = obtenerSesion();
    return sesion ? sesion.rol : 'visitante';
}

// Ruta hacia la carpeta Frontend desde la página actual (se define en <body data-base="...">)
function obtenerBase() {
    return document.body.dataset.base || '';
}

// Si la página tiene <body data-roles="usuario,admin">, solo esos roles pueden entrar
function protegerPagina() {
    const permitidos = document.body.dataset.roles;
    if (!permitidos) return;

    if (!permitidos.split(',').includes(obtenerRol())) {
        window.location.href = obtenerBase() + 'index.html?acceso=denegado';
    }
}

protegerPagina();
