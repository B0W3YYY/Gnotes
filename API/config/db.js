const mongoose = require('mongoose');

// Conecta a MongoDB con la URI del .env y avisa en consola cada cambio de estado
async function conectarDB() {
    mongoose.connection.on('connected', () => console.log('MongoDB conectado'));
    mongoose.connection.on('error', (error) => console.error('Error de MongoDB:', error.message));
    mongoose.connection.on('disconnected', () => console.warn('MongoDB desconectado'));

    if (!process.env.MONGO_URI) {
        console.error('Falta MONGO_URI en el archivo .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error('No se pudo conectar a MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = conectarDB;
