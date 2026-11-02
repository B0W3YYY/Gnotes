// Pruebas unitarias del validador de archivos y de enlaces de vídeo (no necesitan MongoDB)
// Uso: npm run test:multimedia
const assert = require('assert');
const { validarArchivo, formatoPorFirma, LIMITE_IMAGEN } = require('../utils/archivos');
const { normalizarEnlaceVideo } = require('../utils/enlacesVideo');

let pasaron = 0;
function prueba(nombre, fn) {
    try {
        fn();
        pasaron++;
    } catch (error) {
        console.log(`❌ ${nombre}: ${error.message}`);
        process.exitCode = 1;
    }
}

const JPG = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0, 0x10, 0x4A, 0x46, 0x49, 0x46]);
const PNG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D]);
const GIF = Buffer.from('GIF89a......');
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x20]), Buffer.from('ftypisom'), Buffer.alloc(4)]);
const MOV = Buffer.concat([Buffer.from([0, 0, 0, 0x14]), Buffer.from('ftypqt  '), Buffer.alloc(4)]);
const WEBM = Buffer.from([0x1A, 0x45, 0xDF, 0xA3, 0x9F, 0x42, 0x86, 0x81]);
const ZIP = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0, 0, 0, 0]);
const TEXTO = Buffer.from('hola, esto es texto plano');
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

const ok = (nombreOriginal, mimetype, bytes, tamano = 1000) => validarArchivo({ nombreOriginal, mimetype, bytes, tamano });

// ----- Firmas -----
prueba('firma jpg', () => assert.strictEqual(formatoPorFirma(JPG), 'jpg'));
prueba('firma png', () => assert.strictEqual(formatoPorFirma(PNG), 'png'));
prueba('firma gif', () => assert.strictEqual(formatoPorFirma(GIF), 'gif'));
prueba('firma webp', () => assert.strictEqual(formatoPorFirma(WEBP), 'webp'));
prueba('firma mp4', () => assert.strictEqual(formatoPorFirma(MP4), 'mp4'));
prueba('firma mov', () => assert.strictEqual(formatoPorFirma(MOV), 'mov'));
prueba('firma webm', () => assert.strictEqual(formatoPorFirma(WEBM), 'webm'));
prueba('firma zip desconocida', () => assert.strictEqual(formatoPorFirma(ZIP), null));

// ----- Se aceptan -----
prueba('acepta jpg', () => assert.deepStrictEqual(ok('foto.JPG', 'image/jpeg', JPG), { ok: true, formato: 'jpg', tipo: 'imagen' }));
prueba('acepta jpeg', () => assert.ok(ok('foto.jpeg', 'image/jpeg', JPG).ok));
prueba('acepta png', () => assert.ok(ok('a.png', 'image/png', PNG).ok));
prueba('acepta webp', () => assert.ok(ok('a.webp', 'image/webp', WEBP).ok));
prueba('acepta gif', () => assert.ok(ok('a.gif', 'image/gif', GIF).ok));
prueba('acepta mp4', () => assert.strictEqual(ok('clip.mp4', 'video/mp4', MP4, 50e6).tipo, 'video'));
prueba('acepta webm', () => assert.ok(ok('clip.webm', 'video/webm', WEBM).ok));
prueba('acepta mov', () => assert.ok(ok('clip.mov', 'video/quicktime', MOV).ok));

// ----- Se rechazan -----
prueba('rechaza zip', () => assert.ok(!ok('a.zip', 'application/zip', ZIP).ok));
prueba('rechaza py', () => assert.ok(!ok('a.py', 'text/x-python', TEXTO).ok));
prueba('rechaza js', () => assert.ok(!ok('a.js', 'text/javascript', TEXTO).ok));
prueba('rechaza exe', () => assert.ok(!ok('a.exe', 'application/octet-stream', Buffer.from('MZ\x90\x00')).ok));
prueba('rechaza html', () => assert.ok(!ok('a.html', 'text/html', TEXTO).ok));
prueba('rechaza svg', () => assert.ok(!ok('a.svg', 'image/svg+xml', SVG).ok));
prueba('rechaza txt renombrado a png', () => assert.ok(!ok('falso.png', 'image/png', TEXTO).ok));
prueba('rechaza zip renombrado a jpg', () => assert.ok(!ok('falso.jpg', 'image/jpeg', ZIP).ok));
prueba('rechaza png con mime de jpg', () => assert.ok(!ok('a.png', 'image/jpeg', PNG).ok));
prueba('rechaza jpg disfrazado de mp4', () => assert.ok(!ok('a.mp4', 'video/mp4', JPG).ok));
prueba('rechaza doble extensión', () => assert.ok(!ok('a.png.exe', 'image/png', PNG).ok));
prueba('rechaza sin extensión', () => assert.ok(!ok('archivo', 'image/png', PNG).ok));
prueba('rechaza imagen de más de 10 MB', () => assert.ok(!ok('a.png', 'image/png', PNG, LIMITE_IMAGEN + 1).ok));
prueba('rechaza archivo vacío', () => assert.ok(!ok('a.png', 'image/png', PNG, 0).ok));
prueba('nombre en mensaje sin HTML', () => assert.ok(!ok('<img src=x onerror=alert(1)>.zip', 'application/zip', ZIP).mensaje.includes('<')));

// ----- Enlaces de vídeo -----
const enlace = texto => normalizarEnlaceVideo(texto);
const embed = texto => enlace(texto)?.url;

prueba('youtube watch', () => assert.strictEqual(embed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
prueba('youtu.be', () => assert.strictEqual(embed('https://youtu.be/dQw4w9WgXcQ?si=abc'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
prueba('youtube shorts', () => assert.strictEqual(embed('https://youtube.com/shorts/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
prueba('youtube móvil', () => assert.strictEqual(enlace('https://m.youtube.com/watch?v=dQw4w9WgXcQ').proveedor, 'youtube'));
prueba('youtube embed ya normalizado', () => assert.strictEqual(embed('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
prueba('youtube id inválido', () => assert.strictEqual(enlace('https://youtube.com/watch?v=abc"><script>'), null));
prueba('vimeo', () => assert.strictEqual(embed('https://vimeo.com/76979871'), 'https://player.vimeo.com/video/76979871'));
prueba('vimeo player', () => assert.strictEqual(embed('https://player.vimeo.com/video/76979871'), 'https://player.vimeo.com/video/76979871'));
prueba('twitch clip', () => assert.ok(embed('https://clips.twitch.tv/FunnyClipName-abc123').startsWith('https://clips.twitch.tv/embed?clip=FunnyClipName-abc123&parent=')));
prueba('twitch clip de canal', () => assert.ok(embed('https://www.twitch.tv/canal/clip/OtroClip_1').includes('clip=OtroClip_1')));
prueba('twitch vídeo', () => assert.ok(embed('https://www.twitch.tv/videos/123456789').startsWith('https://player.twitch.tv/?video=123456789&parent=')));
prueba('twitch canal en vivo no', () => assert.strictEqual(enlace('https://www.twitch.tv/canal'), null));
prueba('streamable', () => assert.strictEqual(embed('https://streamable.com/abc12'), 'https://streamable.com/e/abc12'));
prueba('kick clip', () => assert.strictEqual(embed('https://kick.com/canal/clips/clip_01HABCDEF123'), 'https://player.kick.com/clip/clip_01HABCDEF123'));
prueba('rechaza http', () => assert.strictEqual(enlace('http://www.youtube.com/watch?v=dQw4w9WgXcQ'), null));
prueba('rechaza javascript:', () => assert.strictEqual(enlace('javascript:alert(1)//youtube.com'), null));
prueba('rechaza data:', () => assert.strictEqual(enlace('data:text/html,<script>alert(1)</script>'), null));
prueba('rechaza host parecido', () => assert.strictEqual(enlace('https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'), null));
prueba('rechaza subdominio falso', () => assert.strictEqual(enlace('https://evilyoutube.com/watch?v=dQw4w9WgXcQ'), null));
prueba('rechaza usuario en URL', () => assert.strictEqual(enlace('https://youtube.com@evil.com/watch?v=dQw4w9WgXcQ'), null));
prueba('rechaza otro host', () => assert.strictEqual(enlace('https://example.com/video.mp4'), null));
prueba('rechaza vacío', () => assert.strictEqual(enlace(''), null));

console.log(process.exitCode ? 'HAY FALLOS' : `TODO OK (${pasaron} pruebas)`);
