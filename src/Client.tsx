import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import "./Client.css";
import BoardBottom from "./frontend/BoardBottom";
import BoardTop from "./frontend/BoardTop";
import Game from "./logic/models/game";
import ThisTurn from "./logic/models/this-turn";
import ThisMove from "./logic/models/this-move";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const socket: Socket = io('https://backgammon-k3pu.onrender.com', {});

export const toastStyle = (thisTurn: ThisTurn) => {
  return {
    style: {
      borderRadius: "10px",
      background: thisTurn._turnPlayer._name,
      color: thisTurn._opponentPlayer._name,
      border:
        thisTurn._turnPlayer._name === "White"
          ? "2px solid black"
          : "2px solid white",
    },
  };
};

function App() {
  const [game, setGame] = useState(Game.new);
  const [thisTurn, setThisTurn] = useState(ThisTurn.new);
  const [thisMove, setThisMove] = useState(ThisMove.new);
  const [playerColor, setPlayerColor] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [inLobby, setInLobby] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // per la durata della partita
  const [gameDuration, setGameDuration] = useState<number>(-1); // -1 per Unlimited
  // Timer specifici per ogni giocatore
  const [whiteTimeLeft, setWhiteTimeLeft] = useState<number>(0); // Tempo del giocatore bianco
  const [blackTimeLeft, setBlackTimeLeft] = useState<number>(0); // Tempo del giocatore nero
  const [timerActive, setTimerActive] = useState(false); // Stato che indica se il timer è attivo

  useEffect(() => {
    console.log("Connecting to server...");

    // Connessione al server
    socket.on("connect", () => {
      console.log("Connected to server", socket);
    });

    socket.on("showToast", ({ message, style }) => {
      toast(message, style);
    });

    socket.on("updateGameState", (newGameState) => {
      if (newGameState) {
        setGame(newGameState.game);
        setThisTurn(newGameState.thisTurn);
        setThisMove(newGameState.thisMove);
      }
    });

    // Nella funzione che aggiorna il timer
    socket.on("updateTimer", ({ color, timeLeft }) => {
      const newTime = timeLeft === -1 ? Infinity : timeLeft;
      if (color === "White") {
        setWhiteTimeLeft(newTime);
      } else {
        setBlackTimeLeft(newTime);
      }
    });

    // Ricezione della durata del gioco
    socket.on("gameDuration", (duration: number) => {
      setGameDuration(duration);
      setWhiteTimeLeft(duration !== -1 ? duration : Infinity);
      setBlackTimeLeft(duration !== -1 ? duration : Infinity);
    });

    socket.on("playerColor", (color: string) => {
      setPlayerColor(color);
      console.log("colore del player:", color);
      toast(`Il tuo colore è ${color}`, toastStyle(thisTurn));
    });

    // Ricezione dell'ID di una nuova partita
    socket.on("gameCreated", (newGameId: string) => {
      setGameId(newGameId);
      setInLobby(false); // esci dalla lobby quando una partita viene creata
      toast(`New game created with ID: ${newGameId}`, {
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });
    });

    socket.on("error", (message: string) => {
      setError(message);
      toast(`Error: ${message}`, {
        style: { borderRadius: "10px", background: "#ff4d4f", color: "#fff" },
      });

      setGameId(null);
      setInLobby(true);
    });

    // Pulizia degli eventi alla disconnessione
    return () => {
      socket.off("updateGameState");
      socket.off("showToast");
      socket.off("connect");
      socket.off("playerColor");
      socket.off("gameCreated");
      socket.off("error");
      socket.off("updateTimer");
      socket.off("gameDuration");
    };
  }, []);

  // Funzione per unirsi a una partita esistente
  const joinGame = () => {
    if (isSearching) stopSearching();
    const id = prompt("Enter the Game ID to join:");
    if (id) {
      setGameId(id);
      socket.emit("joinGame", id);
      setInLobby(false);
    }
  };

  // Funzione per avviare la partita attuale
  const startGame = () => {
    if (!error && gameId) {
      socket.emit("startGame", gameId, gameDuration);
    } else {
      toast("Cannot start game. Please check if you are in a valid game.", {
        style: { background: "#333", color: "#fff" },
      });
    }
  };

  // Funzione rollare dadi
  const rollDice = () => {
    if (gameId && playerColor === thisTurn._turnPlayer._name) {
      socket.emit("rollDice", gameId);
    } else {
      toast("Wait for your turn or join a game first!", toastStyle(thisTurn));
    }
  };

  // Funzione per selezionare pedine e fare mosse
  const select = (index: number | string) => {
    if (gameId && playerColor === thisTurn._turnPlayer._name) {
      socket.emit("select", index, gameId);
    } else {
      toast("Wait for your turn or join a game first!", toastStyle(thisTurn));
    }
  };

  // Funzione per cercare una partita tramite matchmaking
  const findGame = () => {
    console.log("Sending findGame request");
    socket.emit("findGame", { gameDuration });
    setIsSearching(true);
    toast("Searching for a game...", {
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
    });
  };

  // Funzione per smettere di cercare una partita
  const stopSearching = () => {
    console.log("stop searching");
    socket.emit("stopSearching");
    setIsSearching(false);
    toast("Stopped Searching...", {
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
    });
  };

  const createGame = () => {
    if (isSearching) stopSearching();
    socket.emit("createGame", { duration: gameDuration });
  };

  // Funzione di utilità per convertire i secondi in formato mm:ss
  const formatTime = (seconds: number) => {
    if (seconds === Infinity) return "Unlimited";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <>
      {inLobby ? (
        <div className="lobby">
          <h1>Welcome to Backgammon!</h1>
          <h3>Select an option</h3>

          <button onClick={createGame}>Create New Game</button>
          <span> </span>
          <button onClick={joinGame}>Join Existing Game</button>
          <span> </span>
          {!isSearching ? (
            <button onClick={findGame}>Find a casual Game</button>
          ) : (
            <button onClick={stopSearching}>Stop Searching</button>
          )}
          <br />
          <br />
          <br />
          <label>
            Choose game duration:
            <select
              value={gameDuration}
              onChange={(e) => setGameDuration(Number(e.target.value))}
            >
              <option value={-1}>Unlimited</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </label>
          <br />
          <br />
          <br />
          <br />
          <button onClick={() => window.location.reload()}>
            Return to the main Menu
          </button>
        </div>
      ) : (
        <div className="game">
          <h1>Backgammon Game</h1>
          <h3>{gameId ? `Game ID: ${gameId} ` : "No game selected"}</h3>
          <h3>You are {playerColor} player</h3>

          {/* Timer visualizzati per ciascun giocatore */}
          <div className="timer">
            <p>White Time Left: {formatTime(whiteTimeLeft)}</p>
            <p>Black Time Left: {formatTime(blackTimeLeft)}</p>
          </div>

          <BoardTop game={game} thisMove={thisMove} select={select} />
          <BoardBottom
            game={game}
            thisMove={thisMove}
            rollDice={rollDice}
            startGame={startGame}
            select={select}
          />
        </div>
      )}
    </>
  );
}

export default App;
