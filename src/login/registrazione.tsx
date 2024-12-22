import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  switchToLogin: () => void;
}

const Register: React.FC<SignupProps> = ({ switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Per navigare tra le pagine

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Messaggio di successo
      } else {
        const error = await response.json();
        alert("Errore: " + error.message); // Messaggio di errore
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <div className="register-container">
      <h1>Registrati per giocare a Backgammon</h1>
      <form onSubmit={handleRegister}>
        <label>Nome utente:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label>e-mail:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Registrati</button>
        <div>
          Sei già registrato?{" "}
          <span
            onClick={switchToLogin}
            style={{ cursor: "pointer", color: "blue" }}
          >
            Accedi qui
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;
