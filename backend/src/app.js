const express = require('express');
const multer = require('multer');
const path = require('path');
const faceapi = require('@vladmandic/face-api'); // Procesamiento de rostros
const canvas = require('canvas'); // Necesario para manejar imágenes en Face-api.js

const app = express();

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: './uploads', // Directorio donde se guardarán las imágenes subidas
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Inicialización de Face-api
const path = require('path');

async function loadModels() {
  const modelsPath = path.join(__dirname, './models'); // Esto obtiene la ruta completa desde el directorio actual.
  
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
}

loadModels();

// Cargar rostros conocidos (aquí puedes cargar tus imágenes conocidas)
const knownFaces = [];

async function addKnownFace(imagePath, name) {
  const img = await canvas.loadImage(imagePath); 
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

  if (detections) {
    knownFaces.push({ name, descriptor: detections.descriptor });
    console.log(`✔ Añadido: ${name}`);
  } else {
    console.log(`⚠ No se detectó un rostro en ${imagePath}`);
  }
}

// Endpoint para recibir imágenes y procesarlas
app.post('./uploads', upload.single('image'), async (req, res) => {
  const imagePath = path.join(__dirname, './uploads', req.file.filename);
  const img = await canvas.loadImage(imagePath);
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

  if (detections.length === 0) {
    return res.json({ message: "❌ No se encontraron rostros" });
  }

  let match = "❌ No se encontró coincidencia";
  for (const knownFace of knownFaces) {
    const distance = faceapi.euclideanDistance(detections[0].descriptor, knownFace.descriptor);
    if (distance < 0.6) {
      match = `✅ Coincidencia con: ${knownFace.name}`;
      break;
    }
  }

  res.json({ match });
});

module.exports = app; // Exportamos app para usarla en server.js