// Convierte en administrador a un usuario ya registrado.
// Uso: npm run admin -- correo@ejemplo.com
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const correo = (process.argv[2] || '').toLowerCase().trim();

if (!correo) {
    console.log('Uso: npm run admin -- correo@ejemplo.com');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const usuario = await Usuario.findOneAndUpdate({ correo }, { rol: 'admin' }, { returnDocument: 'after', runValidators: true });
    console.log(usuario ? `${usuario.nombre} ahora es admin` : 'No existe un usuario con ese correo');
    await mongoose.disconnect();
});
