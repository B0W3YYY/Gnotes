// Prueba rápida (smoke test) de todos los endpoints CRUD.
// Uso: npm run smoke
// Levanta la API en otro puerto con una base de datos de pruebas aparte
// (la misma URI del .env con "_smoke" al final del nombre), corre los casos y borra esa base al terminar.
require('dotenv').config({ quiet: true });
const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

const PUERTO = process.env.SMOKE_PORT || 5099;
const BASE = `http://localhost:${PUERTO}`;
const sufijo = Date.now();

// Misma base del .env pero con otro nombre, para no tocar datos reales
function uriDePrueba() {
    const url = new URL(process.env.MONGO_URI);
    const nombre = url.pathname.replace('/', '') || 'gnotes';
    url.pathname = `/${nombre}_smoke`;
    return url.toString();
}

const resultados = [];
const subidasSmoke = [];   // archivos subidos en la prueba, se borran al final

async function pedir(metodo, ruta, body, token, crudo) {
    const r = await fetch(BASE + ruta, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: crudo ?? (body ? JSON.stringify(body) : undefined)
    });
    let datos = null;
    try { datos = await r.json(); } catch { datos = '(no es JSON)'; }
    return { s: r.status, d: datos };
}

// Corre una petición y anota si el código HTTP es el esperado
async function caso(entidad, paso, esperado, peticion, extra = () => true) {
    const r = await peticion();
    const esperados = [].concat(esperado);
    const bien = esperados.includes(r.s) && typeof r.d === 'object' && extra(r);
    resultados.push({ entidad, paso, esperado: esperados.join('/'), obtenido: r.s, bien });
    if (!bien) console.log(`  ❌ ${entidad} · ${paso}:`, JSON.stringify(r.d).slice(0, 200));
    return r;
}

function noAplica(entidad, paso, motivo) {
    resultados.push({ entidad, paso, esperado: '-', obtenido: motivo, bien: null });
}

const ID_INEXISTENTE = '64b000000000000000000000';

// Los 10 pasos de la guía para una entidad
async function crud(entidad, o) {
    await caso(entidad, '1. GET lista', 200, () => pedir('GET', o.lista, null, o.token), r => Array.isArray(r.d));
    const creado = await caso(entidad, '2. POST válido', 201, () => pedir('POST', o.crear, o.valido, o.tokenCrear || o.token));
    const id = o.idDe ? o.idDe(creado.d) : creado.d._id;
    const url = `${o.uno}/${id}`;

    await caso(entidad, '3. GET /:id', 200, () => pedir('GET', url, null, o.token), r => r.d._id === id);

    if (o.actualizar) {
        await caso(entidad, '4. PUT válido', 200, () => pedir('PUT', o.actualizar.url(id), o.actualizar.body, o.actualizar.token || o.token),
            o.actualizar.revisar);
    } else noAplica(entidad, '4. PUT válido', o.sinActualizar);

    await caso(entidad, '5. POST inválido', 400, () => pedir('POST', o.crear, o.invalido, o.tokenCrear || o.token), r => !!r.d.message);

    if (o.actualizarMal) {
        await caso(entidad, '6. PUT inválido', 400, () => pedir('PUT', o.actualizarMal.url(id), o.actualizarMal.body, o.actualizarMal.token || o.token));
    } else noAplica(entidad, '6. PUT inválido', o.sinActualizar);

    await caso(entidad, '7. GET id inexistente', 404, () => pedir('GET', `${o.uno}/${ID_INEXISTENTE}`, null, o.token));
    await caso(entidad, '8. GET id malformado', 400, () => pedir('GET', `${o.uno}/abc`, null, o.token));

    if (o.eliminar) {
        await caso(entidad, '9. DELETE', 200, () => pedir('DELETE', o.eliminar.url(id), o.eliminar.body, o.eliminar.token || o.token));
        await caso(entidad, '9b. GET tras borrar', 404, () => pedir('GET', url, null, o.token));
        await caso(entidad, '10. DELETE repetido', 404, () => pedir('DELETE', o.eliminar.url(id), o.eliminar.body, o.eliminar.token || o.token));
    } else {
        noAplica(entidad, '9. DELETE', o.sinEliminar);
        noAplica(entidad, '10. DELETE repetido', o.sinEliminar);
    }
}

async function esperarServidor() {
    for (let i = 0; i < 50; i++) {
        try { if ((await fetch(BASE + '/')).ok) return; } catch { }
        await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('La API no arrancó');
}

(async () => {
    const uri = uriDePrueba();
    const servidor = spawn(process.execPath, ['server.js'], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: PUERTO, MONGO_URI: uri },
        stdio: ['ignore', 'ignore', 'inherit']
    });

    try {
        await esperarServidor();
        await mongoose.connect(uri);

        // Usuarios para las pruebas: un admin y un usuario normal
        const a = await pedir('POST', '/api/usuarios', { nombre: 'Admin Smoke', correo: `admin${sufijo}@test.com`, clave: 'clave123' });
        const b = await pedir('POST', '/api/usuarios', { nombre: 'Usuario Smoke', correo: `user${sufijo}@test.com`, clave: 'clave123' });
        await mongoose.connection.collection('usuarios').updateOne({ _id: new mongoose.Types.ObjectId(a.d.usuario._id) }, { $set: { rol: 'admin' } });
        const admin = a.d.token, user = b.d.token;

        // ----- Cursos (CRUD público) -----
        await crud('Cursos', {
            lista: '/api/cursos', crear: '/api/cursos', uno: '/api/cursos',
            valido: { nombre: 'Programación I', descripcion: 'Curso base', creditos: 4 },
            invalido: { descripcion: 'Sin nombre ni créditos' },
            actualizar: { url: id => `/api/cursos/${id}`, body: { creditos: 3 }, revisar: r => r.d.datos.creditos === 3 },
            actualizarMal: { url: id => `/api/cursos/${id}`, body: { creditos: -1 } },
            eliminar: { url: id => `/api/cursos/${id}` }
        });

        // ----- Roles (CRUD público, nombre único) -----
        await crud('Roles', {
            lista: '/api/roles', crear: '/api/roles', uno: '/api/roles',
            valido: { nombre: `tester${sufijo}`, descripcion: 'Rol de prueba' },
            invalido: { descripcion: 'Sin nombre' },
            actualizar: { url: id => `/api/roles/${id}`, body: { descripcion: 'Actualizado' }, revisar: r => r.d.datos.descripcion === 'Actualizado' },
            actualizarMal: { url: id => `/api/roles/${id}`, body: { nombre: 'x' } },
            eliminar: { url: id => `/api/roles/${id}` }
        });
        await pedir('POST', '/api/roles', { nombre: `unico${sufijo}` });
        await caso('Roles', 'Duplicado unique', 400, () => pedir('POST', '/api/roles', { nombre: `unico${sufijo}` }));

        // ----- Usuarios -----
        let tokenC;
        await crud('Usuarios', {
            token: admin, lista: '/api/usuarios', crear: '/api/usuarios', uno: '/api/usuarios',
            valido: { nombre: 'Carla Smoke', correo: `carla${sufijo}@test.com`, clave: 'clave123' },
            idDe: d => { tokenC = d.token; return d.usuario._id; },
            invalido: { nombre: 'Sin correo', clave: 'clave123' },
            actualizar: { url: () => '/api/usuarios/perfil', body: { biografia: 'Hola' }, get token() { return tokenC; }, revisar: r => r.d.datos.biografia === 'Hola' },
            actualizarMal: { url: () => '/api/usuarios/perfil', body: { correo: 'no-es-correo' }, get token() { return tokenC; } },
            eliminar: { url: id => `/api/usuarios/${id}` }
        });
        await caso('Usuarios', 'Duplicado unique', 400, () => pedir('POST', '/api/usuarios', { nombre: 'Repetido', correo: `user${sufijo}@test.com`, clave: 'clave123' }));
        await caso('Usuarios', 'Respuesta sin clave', 200, () => pedir('GET', '/api/usuarios/perfil', null, user), r => !('clave' in r.d));

        // ----- Guías -----
        await crud('Guías', {
            token: user, lista: '/api/guias', crear: '/api/guias', uno: '/api/guias',
            valido: { titulo: 'Guía smoke', juego: 'Minecraft', categoria: 'Supervivencia', dificultad: 'Fácil', contenido: 'Paso 1' },
            invalido: { juego: 'Minecraft', categoria: 'Supervivencia', dificultad: 'Fácil', contenido: 'Sin título' },
            actualizar: { url: id => `/api/guias/${id}`, body: { titulo: 'Guía editada' }, revisar: r => r.d.datos.titulo === 'Guía editada' },
            actualizarMal: { url: id => `/api/guias/${id}`, body: { dificultad: 'Imposible' } },
            eliminar: { url: id => `/api/guias/${id}` }
        });

        // ----- Multimedia de guías (subida con lista blanca y enlaces de vídeo) -----
        const subirArchivo = async (nombre, tipo, bytes, token) => {
            const datos = new FormData();
            datos.append('archivos', new Blob([bytes], { type: tipo }), nombre);
            const r = await fetch(BASE + '/api/guias/multimedia', { method: 'POST', body: datos, headers: token ? { Authorization: 'Bearer ' + token } : {} });
            const d = await r.json().catch(() => '(no es JSON)');
            for (const a of d.archivos || []) subidasSmoke.push(a.url);
            return { s: r.status, d };
        };
        const PNG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D]);
        const JPG = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0, 0x10, 0x4A, 0x46]);
        const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x20]), Buffer.from('ftypisom'), Buffer.alloc(4)]);
        const imagen = await caso('Multimedia', 'Sube PNG', 201, () => subirArchivo('a.png', 'image/png', PNG, user), r => /^\/uploads\/[a-f0-9]{32}\.png$/.test(r.d.archivos[0].url));
        await caso('Multimedia', 'Sube JPG', 201, () => subirArchivo('a.jpg', 'image/jpeg', JPG, user));
        await caso('Multimedia', 'Sube MP4', 201, () => subirArchivo('a.mp4', 'video/mp4', MP4, user), r => r.d.archivos[0].tipo === 'video');
        await caso('Multimedia', 'Rechaza .zip', 415, () => subirArchivo('a.zip', 'application/zip', Buffer.from('PK\x03\x04'), user));
        await caso('Multimedia', 'Rechaza .py', 415, () => subirArchivo('a.py', 'text/x-python', Buffer.from('print(1)'), user));
        await caso('Multimedia', 'Rechaza .txt renombrado a .png', 415, () => subirArchivo('falso.png', 'image/png', Buffer.from('hola'), user));
        await caso('Multimedia', 'Sin sesión', 401, () => subirArchivo('a.png', 'image/png', PNG));
        const urlImagen = imagen.d.archivos?.[0]?.url;
        const conMultimedia = await caso('Multimedia', 'Guía con imagen y YouTube', 201, () => pedir('POST', '/api/guias', {
            titulo: 'Guía multimedia', juego: 'Minecraft', categoria: 'Otros', dificultad: 'Media', contenido: 'Con imágenes',
            multimedia: [{ tipo: 'imagen', url: urlImagen }, { tipo: 'enlace', url: 'https://youtu.be/dQw4w9WgXcQ' }]
        }, user), r => r.d.multimedia[1].url === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
        await caso('Multimedia', 'Enlace no permitido', 400, () => pedir('PUT', `/api/guias/${conMultimedia.d._id}`, { multimedia: [{ tipo: 'enlace', url: 'javascript:alert(1)' }] }, user));
        await caso('Multimedia', 'Archivo servido', 200, async () => {
            const r = await fetch(BASE + urlImagen);
            return { s: r.headers.get('x-content-type-options') === 'nosniff' ? r.status : 0, d: {} };
        });
        await caso('Multimedia', 'Borrar guía borra el archivo', 404, async () => {
            await pedir('DELETE', `/api/guias/${conMultimedia.d._id}`, null, user);
            await new Promise(r => setTimeout(r, 200));
            const r = await fetch(BASE + urlImagen);
            return { s: r.status, d: {} };
        });

        // ----- Juegos nuevos (guía con un juego que no existe en la web) -----
        const guiaDeJuego = juego => ({ titulo: 'Guía de juego nuevo', juego, categoria: 'Otros', dificultad: 'Media', contenido: 'Contenido de prueba' });
        const nombreNuevo = `Juego Smoke ${sufijo}`;
        await caso('Juegos', 'GET lista pública', 200, () => pedir('GET', '/api/juegos'), r => Array.isArray(r.d));
        await caso('Juegos', 'Juego conocido se publica', 201, () => pedir('POST', '/api/guias', guiaDeJuego('minecraft'), user),
            r => r.d.estado === 'publicada' && r.d.juego === 'Minecraft' && r.d.juegoNuevo === false);
        const pedida = await caso('Juegos', 'Juego nuevo queda pendiente', 201, () => pedir('POST', '/api/guias', guiaDeJuego(nombreNuevo), user),
            r => r.d.estado === 'pendiente' && r.d.juegoNuevo === true);
        const otra = await caso('Juegos', 'Mismo juego, otra guía', 201, () => pedir('POST', '/api/guias', guiaDeJuego(nombreNuevo.toUpperCase()), user));
        await caso('Juegos', 'Nombre con caracteres raros', 400, () => pedir('POST', '/api/guias', guiaDeJuego('<script>x'), user));
        await caso('Juegos', 'Nombre muy corto', 400, () => pedir('POST', '/api/guias', guiaDeJuego('x'), user));
        await caso('Juegos', 'Solicitudes sin ser admin', 403, () => pedir('GET', '/api/admin/juegos/solicitudes', null, user));
        await caso('Juegos', 'Solicitudes (admin)', 200, () => pedir('GET', '/api/admin/juegos/solicitudes', null, admin),
            r => r.d.some(g => g._id === pedida.d._id));
        await caso('Juegos', 'Moderación no publica juego nuevo', 409, () => pedir('PUT', `/api/moderacion/guias/${pedida.d._id}/estado`, { estado: 'publicada' }, admin));
        await caso('Juegos', 'Aprobar crea el juego', 200, () => pedir('PUT', `/api/admin/juegos/solicitudes/${pedida.d._id}/aprobar`, {}, admin),
            r => r.d.datos.juego.nombre === nombreNuevo && r.d.datos.guia.estado === 'publicada');
        await caso('Juegos', 'Aparece en la lista pública', 200, () => pedir('GET', '/api/juegos'), r => r.d.some(j => j.nombre === nombreNuevo));
        await caso('Juegos', 'Ya aprobado: nueva guía se publica', 201, () => pedir('POST', '/api/guias', guiaDeJuego(nombreNuevo.toLowerCase()), user),
            r => r.d.estado === 'publicada' && r.d.juego === nombreNuevo);
        await caso('Juegos', 'Aprobar repetido', 404, () => pedir('PUT', `/api/admin/juegos/solicitudes/${pedida.d._id}/aprobar`, {}, admin));
        await caso('Juegos', 'Rechazar', 200, () => pedir('PUT', `/api/admin/juegos/solicitudes/${otra.d._id}/rechazar`, {}, admin),
            r => r.d.datos.estado === 'rechazada');
        await caso('Juegos', 'Icono inválido', 400, async () => {
            const g2 = await pedir('POST', '/api/guias', guiaDeJuego(`Otro Juego ${sufijo}`), user);
            return pedir('PUT', `/api/admin/juegos/solicitudes/${g2.d._id}/aprobar`, { icono: '/uploads/../server.js' }, admin);
        });

        // Guía fija para comentarios y reportes
        const g = (await pedir('POST', '/api/guias', { titulo: 'Guía base', juego: 'Minecraft', categoria: 'Supervivencia', dificultad: 'Fácil', contenido: 'Texto' }, user)).d._id;

        // ----- Comentarios -----
        await crud('Comentarios', {
            token: user, lista: `/api/comentarios/guia/${g}`, crear: `/api/comentarios/guia/${g}`, uno: '/api/comentarios',
            valido: { texto: 'Buena guía' },
            invalido: { texto: '' },
            actualizar: { url: id => `/api/comentarios/${id}`, body: { texto: 'Muy buena guía' }, revisar: r => r.d.datos.texto === 'Muy buena guía' },
            actualizarMal: { url: id => `/api/comentarios/${id}`, body: { texto: 'x'.repeat(1001) } },
            eliminar: { url: id => `/api/comentarios/${id}` }
        });

        // ----- Reportes -----
        await crud('Reportes', {
            token: admin, tokenCrear: user, lista: '/api/reportes', crear: '/api/reportes', uno: '/api/reportes',
            valido: { tipo: 'guia', objetivo: g, motivo: 'Spam' },
            idDe: d => d.datos._id,
            invalido: { tipo: 'guia', objetivo: g },
            actualizar: { url: id => `/api/reportes/${id}`, body: { accion: 'descartar' } },
            actualizarMal: { url: id => `/api/reportes/${id}`, body: { accion: 'inventada' } },
            eliminar: { url: id => `/api/reportes/${id}` }
        });

        // ----- Sanciones (no se borran: se levantan, es una inactivación lógica) -----
        await crud('Sanciones', {
            token: admin, lista: '/api/admin/sanciones', crear: '/api/admin/sanciones', uno: '/api/admin/sanciones',
            valido: { usuario: b.d.usuario._id, tipo: 'advertencia', motivo: 'Prueba' },
            invalido: { usuario: b.d.usuario._id, tipo: 'advertencia' },
            actualizar: { url: id => `/api/admin/sanciones/${id}/levantar`, revisar: r => r.d.datos.activa === false },
            actualizarMal: { url: () => `/api/admin/sanciones/abc/levantar` },
            sinEliminar: 'se levanta (lógico)'
        });

        // ----- Palabras prohibidas (solo listar, agregar y quitar) -----
        const p = await caso('Palabras', '1. GET lista', 200, () => pedir('GET', '/api/admin/palabras', null, admin));
        const nueva = await caso('Palabras', '2. POST válido', 201, () => pedir('POST', '/api/admin/palabras', { palabra: `smoke${sufijo}` }, admin));
        await caso('Palabras', '5. POST inválido', 400, () => pedir('POST', '/api/admin/palabras', {}, admin));
        await caso('Palabras', 'Duplicado unique', 400, () => pedir('POST', '/api/admin/palabras', { palabra: `smoke${sufijo}` }, admin));
        await caso('Palabras', '8. DELETE id malformado', 400, () => pedir('DELETE', '/api/admin/palabras/abc', null, admin));
        await caso('Palabras', '9. DELETE', 200, () => pedir('DELETE', `/api/admin/palabras/${nueva.d._id}`, null, admin));
        await caso('Palabras', '10. DELETE repetido', 404, () => pedir('DELETE', `/api/admin/palabras/${nueva.d._id}`, null, admin));
        void p;

        // ----- Generales -----
        await caso('General', 'GET / (salud)', 200, () => pedir('GET', '/'));
        await caso('General', 'Ruta inexistente', 404, () => pedir('GET', '/api/no-existe'), r => r.d.ok === false);
        await caso('General', 'JSON mal formado', 400, () => pedir('POST', '/api/cursos', null, null, '{"nombre": '), r => r.d.ok === false);
        await caso('General', 'Sin sesión', 401, () => pedir('POST', '/api/guias', { titulo: 'x' }));
    } catch (error) {
        console.error('ERROR', error);
        resultados.push({ entidad: 'General', paso: 'Ejecución', esperado: '-', obtenido: error.message, bien: false });
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }
        servidor.kill();
        const { borrarSubida } = require('../utils/archivos');
        subidasSmoke.forEach(borrarSubida);
    }

    console.table(resultados.map(r => ({
        Entidad: r.entidad, Paso: r.paso, Esperado: r.esperado, Obtenido: r.obtenido,
        '': r.bien === null ? 'n/a' : r.bien ? '✅' : '❌'
    })));

    const fallos = resultados.filter(r => r.bien === false).length;
    const pasaron = resultados.filter(r => r.bien).length;
    console.log(fallos ? `${fallos} FALLOS de ${pasaron + fallos}` : `TODO OK (${pasaron} casos)`);
    process.exit(fallos ? 1 : 0);
})();
