// ===== Componentes compartidos (SCRUM-19) =====
const MENSAJE_FALLA = 'Estamos teniendo problemas en este momento. Inténtalo de nuevo en unos minutos.';

// Menú de navegación según el rol (SCRUM-18)
// El logo "GNotes" de la barra ya lleva al inicio
const MENU_USUARIO = [
    { texto: 'Explorar', ruta: 'pages/usuario/tips.html' },
    { texto: 'Crear guía', ruta: 'pages/usuario/guia-form.html' },
    { texto: 'Mi panel', ruta: 'pages/usuario/inicio.html' },
    { texto: 'Favoritos', ruta: 'pages/usuario/favoritos.html' }
];

const MENU = {
    visitante: [],
    usuario: MENU_USUARIO,
    moderador: [
        ...MENU_USUARIO,
        { texto: 'Moderación', ruta: 'pages/moderador/panel.html' }
    ],
    admin: [
        ...MENU_USUARIO,
        { texto: 'Moderación', ruta: 'pages/moderador/panel.html' },
        { texto: 'Administración', ruta: 'pages/admin/panel.html' }
    ]
};

function crearNavbar() {
    const base = obtenerBase();
    const rol = obtenerRol();
    const sesion = obtenerSesion();
    const actual = window.location.pathname;

    const links = MENU[rol].map(item => {
        const activo = actual.endsWith(item.ruta) ? 'active' : '';
        return `<li class="nav-item"><a class="nav-link ${activo}" href="${base}${item.ruta}">${item.texto}</a></li>`;
    }).join('');

    const derecha = sesion
        ? `<div class="dropdown">
               <button class="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                   ${escaparTexto(sesion.nombre)}
               </button>
               <ul class="dropdown-menu dropdown-menu-end">
                   <li><a class="dropdown-item" href="${base}pages/usuario/perfil.html">Mi perfil</a></li>
                   ${rol === 'admin' ? `<li><a class="dropdown-item" href="${base}pages/ui/documentacion.html">Documentación UI</a></li>` : ''}
                   <li><hr class="dropdown-divider"></li>
                   <li><button class="dropdown-item" id="botonSalir">Cerrar sesión</button></li>
               </ul>
           </div>`
        : `<a class="btn btn-outline-light btn-sm me-2" href="${base}pages/login.html">Iniciar sesión</a>
           <a class="btn btn-secundario btn-sm" href="${base}pages/registro.html">Crear cuenta</a>`;

    return `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-app">
        <div class="container">
            <a class="navbar-brand" href="${base}index.html">GNotes</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu"
                aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menu">
                <ul class="navbar-nav me-auto">${links}</ul>
                <div class="d-flex align-items-center">${derecha}</div>
            </div>
        </div>
    </nav>`;
}

function crearFooter() {
    return `
    <footer class="footer-app py-3 mt-5">
        <div class="container text-center small">
            GNotes &copy; ${new Date().getFullYear()}
        </div>
    </footer>`;
}

function escaparTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// Alerta reutilizable: mostrarAlerta('idContenedor', 'success' | 'danger' | 'warning', 'texto')
function mostrarAlerta(idContenedor, tipo, texto) {
    document.getElementById(idContenedor).innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${escaparTexto(texto)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
}

// Ventana de confirmación con Bootstrap. Devuelve una promesa con true/false
function confirmar(titulo, texto, textoBoton = 'Confirmar', colorBoton = 'danger') {
    return new Promise(resolver => {
        const id = 'modalConfirmar';
        document.getElementById(id)?.remove();
        document.body.insertAdjacentHTML('beforeend', `
        <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Titulo" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title h5" id="${id}Titulo">${escaparTexto(titulo)}</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">${escaparTexto(texto)}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-${colorBoton}" id="${id}Si">${escaparTexto(textoBoton)}</button>
                    </div>
                </div>
            </div>
        </div>`);

        const elemento = document.getElementById(id);
        const modal = new bootstrap.Modal(elemento);
        let respuesta = false;
        document.getElementById(`${id}Si`).onclick = () => { respuesta = true; modal.hide(); };
        elemento.addEventListener('hidden.bs.modal', () => { elemento.remove(); resolver(respuesta); });
        modal.show();
    });
}

document.body.insertAdjacentHTML('afterbegin', crearNavbar());
document.body.insertAdjacentHTML('beforeend', crearFooter());
document.getElementById('botonSalir')?.addEventListener('click', cerrarSesion);

// Si un administrador cambió el rol o los datos del usuario, la sesión se actualiza sola
(async () => {
    const sesion = obtenerSesion();
    if (!sesion) return;
    try {
        const { ok, datos } = await llamarAPI(`${API.USUARIOS}/perfil`);
        if (ok && (datos.rol !== sesion.rol || datos.nombre !== sesion.nombre)) {
            actualizarSesion({ rol: datos.rol, nombre: datos.nombre, correo: datos.correo });
            location.reload();
        }
    } catch (error) {
        // Sin conexión con la API: se mantiene la sesión guardada
    }
})();
