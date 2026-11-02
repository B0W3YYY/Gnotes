// ===== Multimedia de las guías: formatos, enlaces de vídeo, galería y visor de imágenes =====
// La validación de verdad la hace la API; esto es para avisar antes de subir y para mostrar.
// Si cambias formatos o plataformas, cambia también API/utils/archivos.js y API/utils/enlacesVideo.js

const MB = 1024 * 1024;
const MAX_MULTIMEDIA = 12;
const FORMATOS_SUBIDA = {
    jpg: { tipo: 'imagen', mimes: ['image/jpeg'], limite: 10 * MB },
    jpeg: { tipo: 'imagen', mimes: ['image/jpeg'], limite: 10 * MB },
    png: { tipo: 'imagen', mimes: ['image/png'], limite: 10 * MB },
    webp: { tipo: 'imagen', mimes: ['image/webp'], limite: 10 * MB },
    gif: { tipo: 'imagen', mimes: ['image/gif'], limite: 10 * MB },
    mp4: { tipo: 'video', mimes: ['video/mp4'], limite: 100 * MB },
    webm: { tipo: 'video', mimes: ['video/webm'], limite: 100 * MB },
    mov: { tipo: 'video', mimes: ['video/quicktime'], limite: 100 * MB }
};

// Revisa un archivo antes de subirlo. Devuelve el texto del error o '' si está bien
function errorArchivo(archivo) {
    const ext = archivo.name.includes('.') ? archivo.name.split('.').pop().toLowerCase() : '';
    const formato = FORMATOS_SUBIDA[ext];
    if (!formato || (archivo.type && !formato.mimes.includes(archivo.type))) {
        return `"${archivo.name}" no es un formato permitido (solo JPG, PNG, WEBP, GIF, MP4, WEBM o MOV).`;
    }
    if (archivo.size > formato.limite) {
        return `"${archivo.name}" pesa ${(archivo.size / MB).toFixed(1)} MB. Máximo ${formato.limite / MB} MB para ${formato.tipo === 'imagen' ? 'imágenes' : 'vídeos'}.`;
    }
    if (archivo.size === 0) return `"${archivo.name}" está vacío.`;
    return '';
}

// ----- Enlaces de vídeo: misma lógica que la API, para la vista previa -----
function enlaceDeVideo(texto) {
    let url;
    try { url = new URL(String(texto).trim()); } catch (error) { return null; }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;

    const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
    const partes = url.pathname.split('/').filter(Boolean);
    const padre = encodeURIComponent(location.hostname || 'localhost');

    if (['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'music.youtube.com'].includes(host)) {
        const id = host === 'youtu.be' ? partes[0]
            : url.pathname === '/watch' ? url.searchParams.get('v')
                : ['shorts', 'embed', 'live', 'v'].includes(partes[0]) ? partes[1] : null;
        return /^[\w-]{11}$/.test(id || '') ? { proveedor: 'youtube', url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (['vimeo.com', 'player.vimeo.com'].includes(host)) {
        const id = [...partes].reverse().find(p => /^\d{1,15}$/.test(p));
        return id ? { proveedor: 'vimeo', url: `https://player.vimeo.com/video/${id}` } : null;
    }
    if (['twitch.tv', 'clips.twitch.tv', 'player.twitch.tv'].includes(host)) {
        const clip = host === 'clips.twitch.tv' ? (partes[0] === 'embed' ? url.searchParams.get('clip') : partes[0])
            : partes[1] === 'clip' ? partes[2] : null;
        if (/^[\w-]{1,100}$/.test(clip || '')) return { proveedor: 'twitch', url: `https://clips.twitch.tv/embed?clip=${clip}&parent=${padre}&autoplay=false` };
        const video = partes[0] === 'videos' ? partes[1] : (url.searchParams.get('video') || '').replace(/^v/, '');
        if (/^\d{1,15}$/.test(video || '')) return { proveedor: 'twitch', url: `https://player.twitch.tv/?video=${video}&parent=${padre}&autoplay=false` };
        return null;
    }
    if (host === 'streamable.com') {
        const id = ['e', 'o', 's'].includes(partes[0]) ? partes[1] : partes[0];
        return /^[a-z0-9]{3,20}$/i.test(id || '') ? { proveedor: 'streamable', url: `https://streamable.com/e/${id}` } : null;
    }
    if (['kick.com', 'player.kick.com'].includes(host)) {
        const id = partes[0] === 'clip' ? partes[1] : partes[1] === 'clips' ? partes[2] : url.searchParams.get('clip');
        return /^clip_\w{5,40}$/.test(id || '') ? { proveedor: 'kick', url: `https://player.kick.com/clip/${id}` } : null;
    }
    return null;
}

// Solo se incrustan URL de embed con esta forma exacta (por si la base de datos trae algo raro)
const EMBEDS_PERMITIDOS = [
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}$/,
    /^https:\/\/player\.vimeo\.com\/video\/\d+$/,
    /^https:\/\/clips\.twitch\.tv\/embed\?clip=[\w-]+&parent=[\w.%-]+&autoplay=false$/,
    /^https:\/\/player\.twitch\.tv\/\?video=\d+&parent=[\w.%-]+&autoplay=false$/,
    /^https:\/\/streamable\.com\/e\/[a-z0-9]+$/i,
    /^https:\/\/player\.kick\.com\/clip\/clip_\w+$/
];
const NOMBRE_PROVEEDOR = { youtube: 'YouTube', vimeo: 'Vimeo', twitch: 'Twitch', streamable: 'Streamable', kick: 'Kick' };

// Twitch exige que "parent" sea el dominio donde se ve la página
function embedParaEstaPagina(url) {
    return url.replace(/([?&]parent=)[^&]*/, `$1${encodeURIComponent(location.hostname || 'localhost')}`);
}

// URL completa de un archivo subido (/uploads/...) o null si no tiene la forma esperada
function urlArchivo(url) {
    return /^\/uploads\/[a-f0-9]{32}\.(jpg|png|webp|gif|mp4|webm|mov)$/.test(url || '') ? API_ORIGEN + url : null;
}

// Iframe de un vídeo de YouTube, Vimeo, etc., con permisos mínimos
function htmlEmbed(elemento, titulo) {
    if (!EMBEDS_PERMITIDOS.some(p => p.test(elemento.url || ''))) return '';
    const nombre = NOMBRE_PROVEEDOR[elemento.proveedor] || 'vídeo';
    return `
        <div class="ratio ratio-16x9 marco-embed">
            <iframe src="${escaparAtributo(embedParaEstaPagina(elemento.url))}" title="${escaparAtributo(`Vídeo de ${nombre}: ${titulo}`)}"
                loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
        </div>`;
}

// ----- Galería de la guía: imágenes (abren el visor), vídeos subidos y vídeos incrustados -----
function pintarMultimedia(idContenedor, lista = [], titulo = '') {
    const contenedor = document.getElementById(idContenedor);
    const imagenes = lista.filter(m => m.tipo === 'imagen' && urlArchivo(m.url));
    const videos = lista.filter(m => m.tipo === 'video' && urlArchivo(m.url));
    const enlaces = lista.filter(m => m.tipo === 'enlace');

    const htmlImagenes = imagenes.length ? `
        <div class="galeria-guia">
            ${imagenes.map((m, i) => `
            <button type="button" class="miniatura-galeria" data-ampliar="${escaparAtributo(urlArchivo(m.url))}"
                data-alt="${escaparAtributo(`Imagen ${i + 1} de ${titulo}`)}" aria-label="Ampliar imagen ${i + 1}">
                <img src="${escaparAtributo(urlArchivo(m.url))}" alt="Imagen ${i + 1} de ${escaparAtributo(titulo)}"
                    loading="lazy" decoding="async" width="320" height="180">
            </button>`).join('')}
        </div>` : '';

    const htmlVideos = videos.map((m, i) => `
        <video class="video-guia" controls preload="metadata" playsinline aria-label="Vídeo ${i + 1} de ${escaparAtributo(titulo)}">
            <source src="${escaparAtributo(urlArchivo(m.url))}" type="${m.url.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">
            Tu navegador no puede reproducir este vídeo.
        </video>`).join('');

    const htmlEnlaces = enlaces.map(m => htmlEmbed(m, titulo)).join('');

    contenedor.innerHTML = htmlImagenes + htmlVideos + htmlEnlaces;
    contenedor.classList.toggle('d-none', !contenedor.innerHTML.trim());
    activarVisor(contenedor);
}

// ----- Visor de imágenes (lightbox) con un modal de Bootstrap -----
let modalVisor = null;

function abrirVisor(src, alt) {
    if (!modalVisor) {
        document.body.insertAdjacentHTML('beforeend', `
        <div class="modal fade" id="modalVisor" tabindex="-1" aria-labelledby="tituloVisor" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content visor-contenido">
                    <div class="modal-header border-0 py-2">
                        <h2 class="modal-title h6 text-truncate" id="tituloVisor"></h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body p-0 text-center">
                        <img id="imagenVisor" class="imagen-visor" src="" alt="">
                    </div>
                </div>
            </div>
        </div>`);
        modalVisor = new bootstrap.Modal(document.getElementById('modalVisor'));
        document.getElementById('modalVisor').addEventListener('hidden.bs.modal', () => {
            document.getElementById('imagenVisor').removeAttribute('src');
        });
    }
    const imagen = document.getElementById('imagenVisor');
    imagen.src = src;
    imagen.alt = alt || '';
    document.getElementById('tituloVisor').textContent = alt || 'Imagen';
    modalVisor.show();
}

// Cualquier botón con data-ampliar dentro del contenedor abre el visor (funciona con teclado: es un <button>)
function activarVisor(contenedor) {
    if (contenedor.dataset.visorActivo) return;
    contenedor.dataset.visorActivo = 'si';
    contenedor.addEventListener('click', (e) => {
        const boton = e.target.closest('[data-ampliar]');
        if (boton) abrirVisor(boton.dataset.ampliar, boton.dataset.alt);
    });
}
