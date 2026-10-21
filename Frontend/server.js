const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002;

// Publica los archivos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Frontend is running on http://localhost:${PORT}`);
});
