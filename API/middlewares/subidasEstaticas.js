// ===== Servir y limpiar la carpeta uploads/ =====
const fs = require('fs');
const path = require('path');
const express = require('express');
const { CARPETA_SUBIDAS, PATRON_NOMBRE, TIPO_POR_EXTENSION, archivoEnUso } = require('../utils/archivos');

const estaticos = express.static(CARPETA_SUBIDAS, {
    index: false,
    dotfiles: 'deny',
    redirect: false,
    fallthrough: false,
    maxAge: '7d',
    immutable: true,         // el nombre es aleatorio: un archivo nunca cambia
    setHeaders(res, ruta) {
        const ext = path.extname(ruta).slice(1);
        res.setHeader('Content-Type', TIPO_POR_EXTENSION[ext]);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
        // Aunque alguien abra el archivo directamente, no puede ejecutar nada
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox");
        // El frontend vive en otro puerto/dominio y tiene que poder cargarlos
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
});

// Solo deja pasar nombres con el formato exacto que genera la API (sin carpetas, sin "..", sin tmp/)
function servirSubidas(req, res, next) {
    const nombre = req.path.slice(1);
    if (!['GET', 'HEAD'].includes(req.method) || !PATRON_NOMBRE.test(nombre)) {
        return res.status(404).json({ ok: false, message: "Archivo no encontrado" });
    }
    estaticos(req, res, (error) => {
        if (error && error.status === 404) return res.status(404).json({ ok: false, message: "Archivo no encontrado" });
        next(error);
    });
}

const HORA = 60 * 60 * 1000;

// Borra archivos que nadie usa: subidas temporales viejas y archivos que nunca se agregaron a una guía
// (se espera un día para no borrar lo que alguien está subiendo mientras escribe su guía)
async function limpiarHuerfanos() {
    try {
        const ahora = Date.now();
        const temporal = path.join(CARPETA_SUBIDAS, 'tmp');
        for (const nombre of await fs.promises.readdir(temporal).catch(() => [])) {
            const ruta = path.join(temporal, nombre);
            const datos = await fs.promises.stat(ruta).catch(() => null);
            if (datos && ahora - datos.mtimeMs > HORA) await fs.promises.unlink(ruta).catch(() => { });
        }

        for (const nombre of await fs.promises.readdir(CARPETA_SUBIDAS)) {
            if (!PATRON_NOMBRE.test(nombre)) continue;
            const ruta = path.join(CARPETA_SUBIDAS, nombre);
            const datos = await fs.promises.stat(ruta).catch(() => null);
            if (!datos || ahora - datos.mtimeMs < 24 * HORA) continue;
            if (!(await archivoEnUso(`/uploads/${nombre}`))) {
                await fs.promises.unlink(ruta).catch(() => { });
            }
        }
    } catch (error) {
        console.error('No se pudo limpiar uploads/:', error.message);
    }
}

function programarLimpieza() {
    limpiarHuerfanos();
    setInterval(limpiarHuerfanos, 6 * HORA).unref();
}

module.exports = { servirSubidas, limpiarHuerfanos, programarLimpieza };
