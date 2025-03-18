const express = require('express');
const cors = require('cors'); // Para manejar los CORS
const path = require('path');
const app = require('./app'); // Importamos la configuración de las rutas y lógica desde app.js

const port = 5000;

// Middleware global
app.use(cors());  // Habilitar CORS

// Servir archivos estáticos (si tienes archivos como imágenes, CSS, etc.)
app.use(express.static(path.join(__dirname, './uploads')));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});