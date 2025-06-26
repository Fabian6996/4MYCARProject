import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';

import Register from './components/Register';
import Login from './components/Login';
import AddVehicul from './components/AddVehicul';
import VehiculeDisponibile from './components/VehiculeDisponibile';

import './App.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/add-vehicul">Adaugă Vehicul</Link></li>
        <li><Link to="/vehicule-disponibile">Vehicule Disponibile</Link></li>
        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  );
}

function Layout({ theme, toggleTheme }) {
  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      <Navbar />
      <Routes>
        <Route path="/add-vehicul" element={<AddVehicul />} />
        <Route path="/vehicule-disponibile" element={<VehiculeDisponibile />} />
      </Routes>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="app-container">
        <h1 className="app-title">Aplicație de Monitorizare a Documentelor Auto</h1>
        <p className="app-subtitle">Verifică rapid expirarea ITP-ului, Asigurării și Rovinietei</p>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout theme={theme} toggleTheme={toggleTheme} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
