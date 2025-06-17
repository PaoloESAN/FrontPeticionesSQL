import { Routes, Route } from 'react-router-dom';
import './App.css'
import LoginInicio from './pages/LoginInicio.jsx';
import Inicio from './pages/Inicio.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginInicio></LoginInicio>} />
      <Route path="/inicio" element={<Inicio></Inicio>} />
    </Routes>
  )
}

export default App
