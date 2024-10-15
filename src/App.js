import { useNavigate } from "react-router-dom";
import './App.css';

function App() {
  const navigate = useNavigate();
  return (
    <div className="App" id="app-container">
      <h1 id="welcome-title">Bienvenido</h1>
      <div id="buttons-container">
        <button id="prediction-button" onClick={() => navigate('/prediccion')}>
          Predicción
        </button>
        <button id="retraining-button" onClick={() => navigate('/reentreno')}>
          Reentrenamiento
        </button>
      </div>
    </div>
  );
}

export default App;
