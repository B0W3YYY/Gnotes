const mongoose = require('mongoose');

const PalabraProhibidaSchema = new mongoose.Schema({
    palabra: {
        type: String,
        required: [true, 'La palabra es obligatoria'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [50, 'La palabra no puede pasar de 50 caracteres']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PalabraProhibida', PalabraProhibidaSchema);
