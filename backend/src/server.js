const express = require('express');
const app = require('./app'); // Importamos app.js, que maneja la lógica de la API

const PORT = 5000;

// Inicializamos el servidor en el puerto 5000
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});