const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');

const app = express();
app.use(cors()); // Permitir peticiones desde el frontend

// Asegurar que la carpeta uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Cargar modelos de Face-api.js
async function loadModels() {
  const modelsPath = path.join(__dirname, './models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  console.log("✔ Modelos cargados correctamente");
}

loadModels();

// Base de datos de rostros conocidos
const knownFaces = [];

// Función para añadir rostros conocidos
async function addKnownFace(imagePath, name) {
  const img = await canvas.loadImage(imagePath);
  const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

  if (detections) {
    knownFaces.push({ name, descriptor: detections.descriptor });
    console.log(`✔ Rostro conocido añadido: ${name}`);
  } else {
    console.log(`⚠ No se detectó un rostro en ${imagePath}`);
  }
}

// Función para comparar las imágenes subidas
async function compareFaces(imagePath) {
  const img = await canvas.loadImage(imagePath);
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

  if (detections.length === 0) {
    return "❌ No se encontraron rostros en la imagen";
  }

  let match = "❌ No se encontró coincidencia";
  for (const knownFace of knownFaces) {
    const distance = faceapi.euclideanDistance(detections[0].descriptor, knownFace.descriptor);
    if (distance < 0.6) {
      match = `✅ Coincidencia con: ${knownFace.name}`;
      break;
    }
  }

  return match;
}

// Endpoint para subir y analizar imágenes
app.post('/uploads', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "❌ No se ha subido ninguna imagen" });
  }

  const imagePath = path.join(uploadsDir, req.file.filename);

  // Llama a la función de comparación de rostros
  const result = await compareFaces(imagePath);
  
  // Responde con el resultado de la comparación
  res.json({ match: result });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));