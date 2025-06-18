import { Routes, Route } from 'react-router-dom';
import './App.css'
import LoginInicio from './pages/LoginInicio.jsx';
import Inicio from './pages/Inicio.jsx';
import { BaseDatosProvider } from './context/BaseDatosContext.jsx';

function App() {
  return (
    <BaseDatosProvider>
      <Routes>
        <Route path="/" element={<LoginInicio></LoginInicio>} />
        <Route path="/inicio" element={<Inicio></Inicio>} />
      </Routes>
    </BaseDatosProvider>
  )
}

export default App
