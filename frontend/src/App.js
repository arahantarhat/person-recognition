import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Por favor, selecciona una imagen");
      return;
    }

    setLoading(true);
    setMessage('Cargando...');

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);
      setMessage(response.data.match);
    } catch (error) {
      setLoading(false);
      console.error("Error al subir la imagen:", error);
      setMessage("Error al subir la imagen. Intenta nuevamente.");
    }
  };

  return (
    <div className="app">
      <h1 className="app-title">Reconocimiento de Rostros</h1>

      <div className="upload-container">
        <input 
          type="file" 
          onChange={handleImageChange} 
          className="file-input" 
        />
        <button 
          onClick={handleUpload} 
          className="upload-button"
        >
          Subir Imagen
        </button>
      </div>

      {loading && (
        <div className="loader">
          <div className="loader-spinner"></div>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
