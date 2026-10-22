// ===== Elegir juego al presionar "Buscar Tips" =====
const modalJuegos = new bootstrap.Modal(document.getElementById('modalJuegos'));
const buscarJuego = document.getElementById('buscarJuego');
const listaJuegos = document.getElementById('listaJuegos');

// A dónde lleva cada juego: con sesión a Explorar filtrado; sin sesión, primero a iniciar sesión
function enlaceJuego(nombre) {
    const explorar = '/pages/usuario/tips.html' + (nombre ? `?juego=${encodeURIComponent(nombre)}` : '');
    return obtenerSesion() ? explorar : `pages/login.html?volver=${encodeURIComponent(explorar)}`;
}

// Quita tildes y mayúsculas para que "pubg" encuentre "PUBG: BATTLEGROUNDS"
function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function mostrarJuegos(filtro = '') {
    const buscado = normalizar(filtro);
    const encontrados = JUEGOS.filter(j => normalizar(j.nombre).includes(buscado));

    listaJuegos.innerHTML = encontrados.map(j => `
        <li>
            <a class="juego" href="${enlaceJuego(j.nombre)}">
                <img src="img/juegos/${j.icono}" alt="" width="36" height="36" loading="lazy">
                <span>${escaparTexto(j.nombre)}</span>
            </a>
        </li>`).join('');

    document.getElementById('sinJuegos').classList.toggle('d-none', encontrados.length > 0);
}

document.getElementById('botonTips').addEventListener('click', (e) => {
    e.preventDefault();
    modalJuegos.show();
});

document.getElementById('modalJuegos').addEventListener('shown.bs.modal', () => buscarJuego.focus());

buscarJuego.addEventListener('input', () => mostrarJuegos(buscarJuego.value));

// Enter abre el primer resultado
buscarJuego.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const primero = listaJuegos.querySelector('a');
        if (primero) window.location.href = primero.href;
    }
});

document.getElementById('verTodos').href = enlaceJuego('');
mostrarJuegos();
