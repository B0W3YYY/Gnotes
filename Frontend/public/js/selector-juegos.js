// ===== Elegir juego: con "Buscar Tips" (todos) o con una tarjeta de categoría (solo esa categoría) =====
const modalJuegos = new bootstrap.Modal(document.getElementById('modalJuegos'));
const buscarJuego = document.getElementById('buscarJuego');
const listaJuegos = document.getElementById('listaJuegos');
const tituloJuegos = document.getElementById('tituloJuegos');
const avisoCategoria = document.getElementById('avisoCategoria');
let categoriaActual = null;

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
    const encontrados = JUEGOS
        .filter(j => !categoriaActual || j.categorias.includes(categoriaActual))
        .filter(j => normalizar(j.nombre).includes(buscado));

    listaJuegos.innerHTML = encontrados.map(j => `
        <li>
            <a class="juego" href="${enlaceJuego(j.nombre)}">
                <img src="img/juegos/${j.icono}" alt="" width="36" height="36" loading="lazy">
                <span>${escaparTexto(j.nombre)}</span>
            </a>
        </li>`).join('');

    document.getElementById('sinJuegos').classList.toggle('d-none', encontrados.length > 0);
}

// categoria = null muestra todos los juegos
function abrirSelector(categoria) {
    categoriaActual = categoria;
    tituloJuegos.textContent = categoria ? `Juegos de ${categoria}` : '¿De qué juego buscas tips?';
    avisoCategoria.classList.toggle('d-none', !categoria);
    buscarJuego.value = '';
    buscarJuego.placeholder = categoria ? `Buscar un juego de ${categoria}` : 'Buscar un juego';
    mostrarJuegos();
    listaJuegos.closest('.modal-body').scrollTop = 0;
    modalJuegos.show();
}

// "Buscar Tips": todos los juegos
document.getElementById('botonTips').addEventListener('click', (e) => {
    e.preventDefault();
    abrirSelector(null);
});

// Tarjetas de categoría del inicio: solo los juegos de esa categoría
document.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.foto-juego');
    if (!tarjeta) return;
    e.preventDefault();
    abrirSelector(tarjeta.querySelector('span').textContent.trim());
});

// Dentro de una categoría, permite ver la lista completa
document.getElementById('verTodosJuegos').addEventListener('click', () => {
    categoriaActual = null;
    tituloJuegos.textContent = '¿De qué juego buscas tips?';
    avisoCategoria.classList.add('d-none');
    buscarJuego.placeholder = 'Buscar un juego';
    mostrarJuegos(buscarJuego.value);
    buscarJuego.focus();
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
