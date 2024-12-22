import React, { useState, useEffect } from "react";
import jwt from "jsonwebtoken";

interface Friend {
  username: string;
  _id: string;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    username: string;
  };
  status: "attesa" | "accettata" | "rifiutata";
}

const GestioneAmicizie: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]); // Lista amici
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]); // Richieste di amicizia
  const [friendName, setFriendName] = useState<string>(""); // Nome amico da aggiungere
  const [loading, setLoading] = useState<boolean>(true);

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

  const getAmici = async (userID: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/amici?userID=${userID}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.statusText}`);
      }
  
      return await response.json(); 
    } catch (error) {
      console.error("Errore nel trovare gli amici", error);
      throw error;
    }
  };

  // Carica amici e richieste di amicizia all'avvio
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const amici = await getAmici(userID);
        setFriends(amici);

        const response = await fetch(`http://localhost:3000/api/users/${userID}/friend-requests`);
        const requests = await response.json();
        setFriendRequests(requests);
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userID]);

  const aggiungiAmico = async (userID: string, friendName: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/aggiungi-amici`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, friendName })
      });
      return await response.json();
    } catch (error) {
      console.error("Errore  nell'aggiunta dell'amico:", error);
      throw error;
    }
  };

  const rispondiAmicizia = async (userID: string, requestID: string, risposta: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/rispondi-amicizia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, requestID, risposta })
      });
      return await response.json();
    } catch (error) {
      console.error("Errore durante la risposta alla richiesta di amicizia:", error);
      throw error;
    }
  };

  // Aggiungi un nuovo amico
  const handleAggiungiAmico = async () => {
    try {
      const response = await aggiungiAmico(userID, friendName);
      alert(response.message);
      setFriendName("");
    } catch (error) {
      alert("Errore nell'aggiunta di un amico.");
    }
  };

  // Rispondi a una richiesta di amicizia
  const handleRispondiRichiesta = async (requestID: string, risposta: "accettata" | "rifiutata") => {
    try {
      const response = await rispondiAmicizia(userID, requestID, risposta);
      alert(response.message);
      // Ricarica i dati dopo la risposta
      const amici = await getAmici(userID);
      setFriends(amici);

      const res = await fetch(`"http://localhost:3000/api/users/${userID}/friend-requests`);
      const requests = await res.json();
      setFriendRequests(requests);
    } catch (error) {
      console.error("Errore nella risposta alla richiesta di amicizia:", error);
    }
  };

  return (
    <div>
      <h1>Gestione Amicizie</h1>

      {/* Aggiungi un nuovo amico */}
      <div>
        <input
          type="text"
          placeholder="Nome amico"
          value={friendName}
          onChange={(e) => setFriendName(e.target.value)}
        />
        <button onClick={handleAggiungiAmico}>Aggiungi Amico</button>
      </div>

      {/* Visualizza lista amici */}
      <div>
        <h2>I tuoi amici:</h2>
        {loading ? (
          <p>Caricamento in corso...</p>
        ) : friends.length === 0 ? (
          <p>La tua lista amici è vuota!</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend._id}>{friend.username}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Visualizza richieste di amicizia */}
      <div>
        <h2>Richieste di Amicizia Ricevute:</h2>
        {loading ? (
          <p>Caricamento in corso...</p>
        ) : friendRequests.length === 0 ? (
          <p>Non ci sono richieste di amicizia!</p>
        ) : (
          <ul>
            {friendRequests.map((request) => (
              <li key={request._id}>
                Da: {request.from.username} | Stato: {request.status}
                {request.status === "attesa" && (
                  <div>
                    <button
                      onClick={() => handleRispondiRichiesta(request._id, "accettata")}
                    >
                      Accetta!
                    </button>
                    <button
                      onClick={() => handleRispondiRichiesta(request._id, "rifiutata")}
                    >
                      Rifiuta!
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GestioneAmicizie;