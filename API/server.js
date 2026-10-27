require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errores');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Si la petición no trae cuerpo, req.body queda como objeto vacío
app.use((req, res, next) => {
    req.body ??= {};
    next();
});

// Ruta de salud
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'API de GNotes funcionando' });
});

app.use('/api/usuarios', require('./routes/UsuarioRoutes'));
app.use('/api/guias', require('./routes/GuiaRoutes'));
app.use('/api/comentarios', require('./routes/ComentarioRoutes'));
app.use('/api/reportes', require('./routes/ReporteRoutes'));
app.use('/api/moderacion', require('./routes/ModeracionRoutes'));
app.use('/api/admin', require('./routes/AdminRoutes'));
app.use('/api/cursos', require('./routes/CursoRoutes'));
app.use('/api/roles', require('./routes/RolesRoutes'));

// Siempre al final: rutas inexistentes y errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

conectarDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});
