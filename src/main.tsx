import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthPage from "./login/AuthPage";
import Menu from "./frontend/components/Menu";
import Client from "./Client";
import Guide from "./frontend/components/Guide";
import GestioneAmicizie from "./login/GestioneAmicizie";
const App = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Redirect dalla root a /auth */}
        <Route path="/" element={<Navigate to="/auth" />} />

        {/* Route per la pagina di autenticazione */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Route per il menu principale */}
        <Route
          path="/menu"
          element={<Menu onSelectOption={handleSelectOption} />}
        />
          
          {/* Route per la guida */}
        <Route path="/guide" element={<Guide />} />
        
        {/* Route per il client del gioco */}
        <Route path="/client" element={<Client />} />
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
