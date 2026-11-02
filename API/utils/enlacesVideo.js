// ===== Enlaces de vídeo permitidos en las guías =====
// Solo YouTube, Vimeo, Twitch, Streamable y Kick. Se saca el ID del enlace y se arma
// nosotros mismos la URL para incrustar (embed): nunca se guarda la URL que mandó el usuario tal cual.
// Si cambias esta lista, cambia también Frontend/public/js/multimedia.js

const ID_YOUTUBE = /^[\w-]{11}$/;
const ID_NUMERICO = /^\d{1,15}$/;
const SLUG = /^[\w-]{1,100}$/;

// Dominio "padre" que Twitch exige en sus embeds (el dominio del frontend)
function dominioFrontend() {
    try {
        return new URL(process.env.FRONTEND_URL || 'http://localhost:5002').hostname;
    } catch (error) {
        return 'localhost';
    }
}

function hostSinWww(url) {
    return url.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
}

const PROVEEDORES = [
    {
        nombre: 'youtube',
        hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'music.youtube.com'],
        sacarId(url, host) {
            const partes = url.pathname.split('/').filter(Boolean);
            if (host === 'youtu.be') return partes[0];
            if (url.pathname === '/watch') return url.searchParams.get('v');
            if (['shorts', 'embed', 'live', 'v'].includes(partes[0])) return partes[1];
            return null;
        },
        valido: id => ID_YOUTUBE.test(id),
        embed: id => `https://www.youtube-nocookie.com/embed/${id}`
    },
    {
        nombre: 'vimeo',
        hosts: ['vimeo.com', 'player.vimeo.com'],
        sacarId(url) {
            // vimeo.com/123456, vimeo.com/channels/x/123456, player.vimeo.com/video/123456
            const partes = url.pathname.split('/').filter(Boolean);
            return [...partes].reverse().find(p => ID_NUMERICO.test(p));
        },
        valido: id => ID_NUMERICO.test(id),
        embed: id => `https://player.vimeo.com/video/${id}`
    },
    {
        nombre: 'twitch',
        hosts: ['twitch.tv', 'clips.twitch.tv', 'player.twitch.tv'],
        sacarId(url, host) {
            const partes = url.pathname.split('/').filter(Boolean);
            // clips.twitch.tv/NombreClip o twitch.tv/canal/clip/NombreClip
            if (host === 'clips.twitch.tv') return partes[0] === 'embed' ? `clip:${url.searchParams.get('clip')}` : `clip:${partes[0]}`;
            if (partes[1] === 'clip') return `clip:${partes[2]}`;
            // twitch.tv/videos/123456
            if (partes[0] === 'videos') return `video:${partes[1]}`;
            if (host === 'player.twitch.tv' && url.searchParams.get('video')) return `video:${url.searchParams.get('video').replace(/^v/, '')}`;
            return null;
        },
        valido(id) {
            const [clase, valor] = String(id).split(':');
            if (clase === 'clip') return SLUG.test(valor || '');
            if (clase === 'video') return ID_NUMERICO.test(valor || '');
            return false;
        },
        embed(id) {
            const [clase, valor] = id.split(':');
            const padre = encodeURIComponent(dominioFrontend());
            return clase === 'clip'
                ? `https://clips.twitch.tv/embed?clip=${valor}&parent=${padre}&autoplay=false`
                : `https://player.twitch.tv/?video=${valor}&parent=${padre}&autoplay=false`;
        }
    },
    {
        nombre: 'streamable',
        hosts: ['streamable.com'],
        sacarId(url) {
            const partes = url.pathname.split('/').filter(Boolean);
            return ['e', 'o', 's'].includes(partes[0]) ? partes[1] : partes[0];
        },
        valido: id => /^[a-z0-9]{3,20}$/i.test(id),
        embed: id => `https://streamable.com/e/${id}`
    },
    {
        nombre: 'kick',
        hosts: ['kick.com', 'player.kick.com'],
        // Kick solo permite incrustar clips: kick.com/canal/clips/clip_XXXX o kick.com/canal?clip=clip_XXXX
        sacarId(url) {
            const partes = url.pathname.split('/').filter(Boolean);
            if (partes[0] === 'clip' && partes[1]) return partes[1];   // player.kick.com/clip/clip_XXXX
            if (partes[1] === 'clips' && partes[2]) return partes[2];
            return url.searchParams.get('clip');
        },
        valido: id => /^clip_[\w]{5,40}$/.test(id),
        embed: id => `https://player.kick.com/clip/${id}`
    }
];

// Recibe lo que pegó el usuario y devuelve { proveedor, url } con la URL de embed, o null si no se acepta
function normalizarEnlaceVideo(texto) {
    const valor = String(texto || '').trim();
    if (!valor || valor.length > 500) return null;

    let url;
    try {
        url = new URL(valor);
    } catch (error) {
        return null;
    }
    // Solo https (fuera javascript:, data:, http sin cifrar, etc.) y sin usuario/clave en la URL
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;

    const host = hostSinWww(url);
    const proveedor = PROVEEDORES.find(p => p.hosts.includes(host));
    if (!proveedor) return null;

    let id = proveedor.sacarId(url, host);
    if (id) id = String(id).trim();
    if (!id || !proveedor.valido(id)) return null;

    return { proveedor: proveedor.nombre, url: proveedor.embed(id) };
}

const NOMBRES_PROVEEDORES = PROVEEDORES.map(p => p.nombre);

module.exports = { normalizarEnlaceVideo, NOMBRES_PROVEEDORES };
