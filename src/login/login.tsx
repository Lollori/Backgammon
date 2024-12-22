import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    switchToRegister: () => void;
  }
  
  const Login: React.FC<LoginProps> = ({ switchToRegister }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  
    const navigate = useNavigate();
  
    const handleLogin = async (event: React.FormEvent) => {
      event.preventDefault();
      
      const data = { username, password };
  
      try {
          const response = await fetch("http://localhost:3000/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
          });
  
          if (response.ok) {
              const responseData = await response.json();
              const token = responseData.token; // Ottieni il token dalla risposta
              localStorage.setItem("token", token); // Salva il token nel localStorage
              console.log("Login successful");
              setError("");
              navigate("/menu"); // Naviga alla pagina del menu
          } else if (response.status === 401) {
              // Mostra messaggio chiaro per l'utente
              const responseData = await response.json();
              setError( "Credenziali non valide. Riprova.");
          } else {
              setError(`Errore imprevisto: ${response.status}`);
          }
      } catch (err) {
          console.error("Errore durante la connessione:", err);
          setError("Errore di connessione con il server.");
      }
  };
  

  const handleGuestLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/guest-login",
       { method: "POST" });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        navigate("/menu"); // Naviga alla pagina del gioco
      } else {
        alert("Errore durante l'accesso come ospite");
      }
    } catch (error) {
      alert("Errore di connessione con il server");
    }
  };

  return (
    <div className="login-container">
      <h1>Accedi per giocare a Backgammon</h1>
      <form id="loginForm" onSubmit={handleLogin}>
        <label>Inserisci Nome utente (o email):</label>
        <input
         type="text"
         placeholder="Nome utente"
         value={username}
         onChange={(e) => setUsername(e.target.value)}
         required 
        />
        <br />
        <label>Inserisci password:</label>
        <input 
         type="password"
         placeholder="Password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         required
        />
        <br />
        <button type="submit">Accedi</button>
      </form>
      <button onClick={handleGuestLogin}>Gioca come ospite</button>
      <div>
        Non sei ancora registrato?{" "}
        <span
          onClick={switchToRegister}
          style={{ cursor: "pointer", color: "blue" }}
        >
          Registrati qui
        </span>
      </div>
    </div>
  );
};

export default Login;
