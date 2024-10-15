import React, { useState } from 'react';
import Papa from 'papaparse';
import './Reentrenamiento.css';

function Reentreno() {
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState(null);
  const [trainingResults, setTrainingResults] = useState(null);
  const [apiData, setApiData] = useState('Esperando respuesta de la API...');

  // Función para convertir CSV a JSON con las dos columnas esperadas
  const csvToJson = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data = results.data;
          const jsonData = {
            Textos_espanol: [],
            sdg: []
          };

          data.forEach(row => {
            jsonData.Textos_espanol.push(row.Textos_espanol);
            jsonData.sdg.push(row.sdg);
          });

          resolve(jsonData);
        },
        error: function (error) {
          reject(error);
        }
      });
    });
  };

  // Manejador de subida de archivo
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);

    csvToJson(uploadedFile)
      .then((jsonData) => {
        setJsonResult(jsonData);
        postToApi(jsonData);
      })
      .catch((error) => {
        console.error('Error al convertir el archivo CSV:', error);
      });
  };

  // Función para hacer el POST a la API
  const postToApi = async (jsonData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();
      console.log(data);
      setTrainingResults(data);
    } catch (error) {
      setApiData('Error al obtener datos de la API');
    }
  };

  return (
    <div id="retraining-container">
      <h2 id="retraining-title">Reentrenamiento del Modelo</h2>
      <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} />
      {file && <p id="file-name">Archivo subido: {file.name}</p>}
      
      {jsonResult && <pre id="json-result">{JSON.stringify(jsonResult, null, 2)}</pre>}

      {trainingResults && (
        <div id="training-results">
          <h3 id="results-title">Resultados del Reentrenamiento</h3>
          <p><strong>Precisión:</strong> {trainingResults.accuracy}</p>
          <p><strong>Recall:</strong> {trainingResults.recall}</p>
          <p><strong>F1 Score:</strong> {trainingResults.f1_score}</p>
        </div>
      )}

      {apiData && <p id="api-response">{apiData}</p>}
    </div>
  );
}

export default Reentreno;
