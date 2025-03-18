import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false); // Para mostrar un estado de carga mientras se sube la imagen

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setLoading(true); // Activar el estado de carga
    const formData = new FormData();
    formData.append("image", file);
    
    console.log("Enviando imagen:", file.name);  // Verifica el archivo que se está enviando
  
    try {
      const response = await axios.post("http://localhost:5000/backend/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.match);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setResult("❌ Ocurrió un error al procesar la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reconocimiento de Personas</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Cargando..." : "Subir Imagen"}
      </button>
      <p>Resultado: {result}</p>
    </div>
  );
}

export default App;
