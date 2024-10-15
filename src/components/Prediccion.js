import React, { useState } from 'react';
import './Prediccion.css';

function Prediccion() {
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [apiData, setApiData] = useState('Esperando respuesta de la API...');

  const csvToJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const result = { Textos_espanol: [] };

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].trim();
          const cleanedLine = currentLine.replace(/^"(.*)"$/, '$1');
          if (cleanedLine) {
            result.Textos_espanol.push(cleanedLine);
          }
        }

        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo CSV'));
      };

      reader.readAsText(file);
    });
  };

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

  const postToApi = async (jsonData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
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
      setPredictions(data.prediction);
    } catch (error) {
      setApiData('Error al obtener datos de la API');
    }
  };

  return (
    <div id="prediction-container">
      <h2 id="prediction-title">Predicción</h2>
      <input id="file-input" type="file" accept=".csv" onChange={handleFileUpload} />
      {file && <p id="file-name">Archivo subido: {file.name}</p>}

      {jsonResult && (
        <pre id="json-result">
          {JSON.stringify(jsonResult, null, 2)}
        </pre>
      )}

      {predictions && jsonResult && (
        <table id="prediction-table" border="1">
          <thead>
            <tr>
              <th>Comentario</th>
              <th>Predicción</th>
            </tr>
          </thead>
          <tbody>
            {jsonResult.Textos_espanol.map((comentario, index) => (
              <tr key={index}>
                <td>{comentario}</td>
                <td>{predictions[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {apiData && <p id="api-response">{apiData}</p>}
    </div>
  );
}

export default Prediccion;
