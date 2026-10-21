const mongoose = require('mongoose');

const PalabraProhibidaSchema = new mongoose.Schema({
    palabra: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PalabraProhibida', PalabraProhibidaSchema);
