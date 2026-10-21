// Prueba de punta a punta de la API.
// Uso: con la API corriendo (npm run dev), en otra terminal: npm test
// Crea usuarios y datos de prueba y los borra al terminar.
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

const U = 'http://localhost:5001';
const sufijo = Date.now();
let fallos = 0;

function ok(cond, msg) { console.log((cond ? 'OK  ' : 'FAIL') + ' ' + msg); if (!cond) fallos++; }

async function api(metodo, ruta, body, token) {
    const r = await fetch(U + ruta, {
        method: metodo,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });
    let data = null; try { data = await r.json(); } catch { }
    return { s: r.status, d: data };
}

(async () => {
    const creados = [];
    try {
        const a = await api('POST', '/usuarios', { nombre: 'Ana Prueba', correo: `ana${sufijo}@test.com`, clave: 'clave123' });
        ok(a.s === 201 && a.d.token, 'registro devuelve token');
        const b = await api('POST', '/usuarios', { nombre: 'Beto Prueba', correo: `beto${sufijo}@test.com`, clave: 'clave123' });
        const ta = a.d.token, tb = b.d.token; creados.push(a.d.usuario._id, b.d.usuario._id);

        ok((await api('POST', '/usuarios', { nombre: 'x', correo: `x${sufijo}@test.com`, clave: '1' })).s === 400, 'rechaza clave corta');
        ok((await api('POST', '/usuarios/login', { correo: `ana${sufijo}@test.com`, clave: 'mala' })).s === 401, 'login incorrecto 401');
        ok((await api('POST', '/usuarios/login', { correo: `ANA${sufijo}@test.com`, clave: 'clave123' })).s === 200, 'login correcto');
        ok((await api('GET', '/usuarios/perfil')).s === 401, 'perfil sin sesión 401');
        const perfil = await api('GET', '/usuarios/perfil', null, ta);
        ok(perfil.s === 200 && !('clave' in perfil.d), 'perfil no expone clave');
        ok((await api('PUT', '/usuarios/perfil', { biografia: 'Hola' }, ta)).d.datos.biografia === 'Hola', 'editar perfil');
        ok((await api('GET', '/usuarios', null, ta)).s === 403, 'listar usuarios no admin 403');

        const g = await api('POST', '/guias', { titulo: 'Guía de prueba', juego: 'Minecraft', categoria: 'Supervivencia', dificultad: 'Fácil', contenido: 'Paso 1...' }, ta);
        ok(g.s === 201 && g.d.estado === 'publicada', 'crear guía');
        const gid = g.d._id;
        ok((await api('GET', '/guias?q=prueba&categoria=Supervivencia&orden=votadas')).d.some(x => x._id === gid), 'buscar + filtrar + ordenar');
        ok((await api('PUT', `/guias/${gid}`, { titulo: 'Hack' }, tb)).s === 403, 'otro usuario no puede editar');
        ok((await api('PUT', `/guias/${gid}`, { titulo: 'Guía editada' }, ta)).d.datos.titulo === 'Guía editada', 'autor edita');
        ok((await api('POST', `/guias/${gid}/voto`, null, ta)).s === 400, 'no votar propia');
        ok((await api('POST', `/guias/${gid}/voto`, null, tb)).d.totalVotos === 1, 'votar');
        ok((await api('POST', `/guias/${gid}/favorito`, null, tb)).d.esFavorito === true, 'favorito');
        ok((await api('GET', '/usuarios/perfil/favoritos', null, tb)).d.length === 1, 'listar favoritos');
        const det = await api('GET', `/guias/${gid}`, null, tb);
        ok(det.d.yaVoto && det.d.esFavorito && det.d.vistas === 1, 'detalle con voto/favorito/vista');
        ok((await api('POST', `/guias/${gid}/compartir`)).d.compartidos === 1, 'compartir');
        const c = await api('POST', `/comentarios/guia/${gid}`, { texto: 'Buena guía' }, tb);
        ok(c.s === 201, 'comentar');
        ok((await api('GET', `/comentarios/guia/${gid}`)).d.length === 1, 'listar comentarios');
        ok((await api('POST', '/reportes', { tipo: 'guia', objetivo: gid, motivo: 'Spam' }, tb)).s === 201, 'reportar');
        ok((await api('GET', '/reportes', null, tb)).s === 403, 'reportes solo moderador');
        const est = await api('GET', '/usuarios/perfil/estadisticas', null, ta);
        ok(est.d.guias === 1 && est.d.votos === 1, 'estadísticas dashboard');

        // Hacer admin a Ana directamente en la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        await mongoose.connection.collection('usuarios').updateOne({ _id: new mongoose.Types.ObjectId(a.d.usuario._id) }, { $set: { rol: 'admin' } });

        const rep = await api('GET', '/reportes', null, ta);
        ok(rep.s === 200 && rep.d.length >= 1, 'admin ve reportes');
        const miRep = rep.d.find(r => r.objetivo === gid);
        ok((await api('PUT', `/reportes/${miRep._id}`, { accion: 'ocultar' }, ta)).s === 200, 'ocultar reportado');
        ok((await api('GET', `/guias/${gid}`)).s === 404, 'guía oculta no visible');
        ok((await api('PUT', `/moderacion/guias/${gid}/estado`, { estado: 'publicada' }, ta)).s === 200, 'restaurar guía');

        const p = await api('POST', '/admin/palabras', { palabra: 'tramposo' + sufijo }, ta);
        ok(p.s === 201, 'agregar palabra prohibida');
        const g2 = await api('POST', '/guias', { titulo: 'Eres tramposo' + sufijo, juego: 'X', categoria: 'Otros', dificultad: 'Media', contenido: 'texto' }, tb);
        ok(g2.d.estado === 'pendiente', 'palabra prohibida -> pendiente');
        ok((await api('GET', '/moderacion/guias?estado=pendiente', null, ta)).d.some(x => x._id === g2.d._id), 'lista pendientes');
        ok((await api('POST', `/comentarios/guia/${gid}`, { texto: 'tramposo' + sufijo }, tb)).s === 400, 'comentario con prohibida rechazado');

        const s = await api('POST', '/admin/sanciones', { usuario: b.d.usuario._id, tipo: 'suspension', motivo: 'Prueba', hasta: new Date(Date.now() + 86400000) }, ta);
        ok(s.s === 201, 'aplicar sanción');
        ok((await api('POST', '/usuarios/login', { correo: `beto${sufijo}@test.com`, clave: 'clave123' })).s === 403, 'suspendido no entra');
        ok((await api('POST', '/guias', { titulo: 't', juego: 'X', categoria: 'Otros', dificultad: 'Media', contenido: 'x' }, tb)).s === 403, 'suspendido no publica');
        ok((await api('PUT', `/admin/sanciones/${s.d._id}/levantar`, null, ta)).s === 200, 'levantar sanción');
        ok((await api('GET', '/moderacion/historial', null, ta)).d.length >= 4, 'historial moderación');
        ok((await api('GET', '/admin/estadisticas', null, ta)).s === 200, 'estadísticas admin');
        ok((await api('PUT', `/usuarios/${b.d.usuario._id}/rol`, { rol: 'moderador' }, ta)).d.datos.rol === 'moderador', 'cambiar rol');

        ok((await api('POST', '/usuarios/recuperar', { correo: 'noexiste@test.com' })).s === 200, 'recuperar responde igual');
        ok((await api('POST', '/usuarios/restablecer', { token: 'malo', clave: 'nueva123' })).s === 400, 'token inválido');

        ok((await api('DELETE', `/guias/${g2.d._id}`, null, ta)).s === 200, 'moderador/admin elimina guía');
        ok((await api('DELETE', '/usuarios/perfil', { clave: 'mala' }, tb)).s === 400, 'eliminar cuenta pide clave');
        ok((await api('DELETE', '/usuarios/perfil', { clave: 'clave123' }, tb)).s === 200, 'eliminar cuenta');
        ok((await api('DELETE', `/admin/palabras/${p.d._id}`, null, ta)).s === 200, 'quitar palabra');
        ok((await api('DELETE', `/guias/${gid}`, null, ta)).s === 200, 'autor elimina guía');
    } catch (e) {
        console.log('ERROR', e); fallos++;
    } finally {
        // Limpieza de todo lo creado en la prueba
        if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGO_URI);
        const ids = creados.map(i => new mongoose.Types.ObjectId(i));
        const db = mongoose.connection;
        await db.collection('usuarios').deleteMany({ _id: { $in: ids } });
        await db.collection('guias').deleteMany({ autor: { $in: ids } });
        await db.collection('comentarios').deleteMany({ autor: { $in: ids } });
        await db.collection('reportes').deleteMany({ reportadoPor: { $in: ids } });
        await db.collection('sancions').deleteMany({ usuario: { $in: ids } });
        await db.collection('accionmoderacions').deleteMany({ realizadaPor: { $in: ids } });
        await mongoose.disconnect();
        console.log(fallos ? `${fallos} FALLOS` : 'TODO OK');
    }
})();
