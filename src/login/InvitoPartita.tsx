import React, { useState, useEffect } from "react";
import jwt from "jsonwebtoken";

interface GameInvite {
  _id: string; 
  from: { _id: string; username: string }; 
  status: "attesa" | "accettata" | "rifiutata";
}

const InvitoPartita = () => {
    const [friendID, setFriendID] = useState("");
    const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);

    const getUserId = () =>{
      const token = localStorage.getItem('token'); // Recupera il token
      if(token){
  
        const decoded = jwt.decode(token);
        if (typeof decoded === "object" && decoded !== null) return decoded.userId; // Accedi a userId solo se decoded è un oggetto
        else console.error("Token non valido");
        
      }else {
      console.log('Token non trovato!');
      }
    }
  
    const userID = getUserId();
  
    // inviti di gioco
    useEffect(() => {
      if (userID) {
        fetchInvites();
      }
    }, [userID]);
  
    const fetchInvites = async () => {
      if (!userID) {
        console.error("Nessun userID disponibile");
        return;
      }
      try {
        const response = await fetch(`http://localhost:3000/api/user/${userID}/game-invites`);
        const requests = await response.json();
        setGameInvites(requests);
      } catch (error) {
        console.error("Errore nel caricamento degli inviti:", error);
      }
    };

  const sendInvite = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/invito-partita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, friendID })
      });
      alert(response.json());
      setFriendID(""); // Reset input
    } catch (error) {
      console.error("Errore nell'invio dell'invito:", error);
    }
  };

  const respondInvite = async (invitoID: string, risposta: string) => {
    if (!userID) {
      console.error("Nessun userID disponibile");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/rispondi-invito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, invitoID, risposta })
      });
      alert(response.json());
      fetchInvites();
    } catch (error) {
      console.error("Errore nella risposta all'invito:", error);
    }
  };

  return (
    <div>
      <h1>Cerca un avversario:</h1>
      <div>
        <input
          type="text"
          value={friendID}
          onChange={(e) => setFriendID(e.target.value)}
          placeholder="ID amico"
        />
        <button onClick={sendInvite}>Invia Invito</button>
      </div>

      <h2>Inviti Ricevuti:</h2>
      <ul>
  {gameInvites.map((invite) => (
    <li key={invite._id}>
      Da: {invite.from.username} | Stato: {invite.status}
      {invite.status === "attesa" && (
        <div>
          <button onClick={() => respondInvite(invite._id, "accettata")}>
            Accetta
          </button>
          <button onClick={() => respondInvite(invite._id, "rifiutata")}>
            Rifiuta
          </button>
        </div>
      )}
    </li>
  ))}
</ul>
    </div>
  );
};

export default InvitoPartita;