  import { createServer } from 'http';
  import { Server, Socket } from 'socket.io';
  import Game from '../logic/models/game';
  import express from 'express';
  import session from 'express-session';
  import MongoStore from 'connect-mongo';
  import ThisTurn from '../logic/models/this-turn.js';
  import ThisMove from '../logic/models/this-move.js';
  import { startingGame } from '../logic/events/start-game.js';
  import { rollingDice } from '../logic/events/roll-dice.js';
  import { checkCantMove } from '../logic/calculations/calc-possible-moves.js';
  import { selecting } from '../logic/events/select.js';
  import logrouter from '../login/logreg.js';
  import dotenv from "dotenv";
  import login from '../login/logreg.js';
  import { celebrateGameEnd } from '../logic/events/end-game';
  import cors from 'cors';
  import path from 'path';

  dotenv.config();
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [`https://backgammon-k3pu.onrender.com`,"http://localhost:5173",],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  
// Middleware CORS per API
app.use(cors({
  origin: 'https://backgammon-k3pu.onrender.com', // Il tuo dominio Render
  methods: ['GET', 'POST'],
}));
  // Configurazione della sessione
  const sessionMiddleware = session({
    secret: "your-secret-key", // Cambia con una chiave segreta sicura
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:`mongodb+srv://thomasbernardi2:YFaUnIw0VI2calIJ@backgammon.rguuk.mongodb.net/backgammon?retryWrites=true&w=majority&authSource=admin`,
  
    }),
    cookie: {
      secure: false, // Metti a true in produzione con HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  });
  
  app.use(sessionMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rotta base per verificare lo stato del server
  app.get('/', (req, res) => {
  res.send('Backend is running!');
});

  
  // Monta il router di login
  app.use(logrouter);
  
  app.use(login);

  // Middleware per gestire rotte non definite
  app.use((req, res, next) => {
  res.status(404).send('Route not found');
});


  // Condividi la sessione con WebSocket
  io.use((socket, next) => {
    sessionMiddleware(socket.request as express.Request, {} as express.Response, next as express.NextFunction);
  });
  
  const games: {
    [gameId: string]: {
      game: Game;
      thisTurn: ThisTurn;
      thisMove: ThisMove;
      players: { white: Socket | null; black: Socket | null };
      GameDuration: number;
      timers: { White: NodeJS.Timeout | null; Black: NodeJS.Timeout | null };
      timeLeft: { White: number; Black: number };
    };
  } = {};

  
  interface Player extends Socket {
    gameDuration: number;
  }
  
  const waitingPlayers: Player[] = [];
  
  function matchmakePlayer() {
    console.log("Inizio matchmaking, giocatori in attesa:", waitingPlayers.length);
  
    // Raggruppa i giocatori per durata del gioco
    const groupedPlayers: { [key: number]: Player[] } = {};
  
    waitingPlayers.forEach(player => {
      if (!player.gameDuration) {
        console.error(`Giocatore ${player.id} non ha una durata valida, rimosso dalla coda.`);
        return; // Ignora i giocatori senza durata valida
      }
  
      if (!groupedPlayers[player.gameDuration]) {
        groupedPlayers[player.gameDuration] = [];
      }
      groupedPlayers[player.gameDuration].push(player);
    });
  
    console.log("Giocatori raggruppati per durata:", groupedPlayers);
  
    // Esegui matchmaking per ogni gruppo
    for (const duration in groupedPlayers) {
      const players = groupedPlayers[Number(duration)];
  
      console.log(`Tentativo di matchmaking per durata ${duration} con ${players.length} giocatori.`);
  
      while (players.length >= 2) {
        const player1 = players.shift();
        const player2 = players.shift();
  
        if (player1 && player2) {
          const gameId = `game-${Date.now()}`;
          const game = Game.new();
          game._gameOn = true;
  
          games[gameId] = {
            game,
            thisTurn: startingGame(game.clone(), io, gameId),
            thisMove: ThisMove.new(),
            players: { white: player1, black: player2 },
            GameDuration: Number(duration),
            timers: { White: null, Black: null },
            timeLeft: { White: Number(duration), Black: Number(duration) },
          };
  
          player1.join(gameId);
          player2.join(gameId);
  
          console.log(`Partita creata: ${gameId}, giocatori: ${player1.id} (White) e ${player2.id} (Black)`);
  
          player1.emit("gameCreated", gameId);
          player2.emit("gameCreated", gameId);
          player1.emit("playerColor", "White");
          player2.emit("playerColor", "Black");
  
          // Invia la durata del gioco a entrambi i giocatori
          player1.emit("gameDuration", Number(duration));
          player2.emit("gameDuration", Number(duration));
        }
      }
    }
  
    // Aggiorna la lista d'attesa con i giocatori non abbinati
    waitingPlayers.length = 0;
    for (const duration in groupedPlayers) {
      waitingPlayers.push(...groupedPlayers[Number(duration)]);
    }
  
    console.log("Giocatori rimanenti in coda:", waitingPlayers.map(player => player.id));
  }
  


  function rollDice(socket: Socket, gameId: string) {
    const gameData = games[gameId];
    
    if (!gameData || gameData.thisTurn._rolledDice) return;

    let returnedThisTurn = rollingDice(gameData.thisTurn.clone(), io, gameId);
    if (returnedThisTurn._rolledDice) {
      returnedThisTurn = checkCantMove(gameData.game, returnedThisTurn.clone(), io, gameId);
    }
    gameData.thisTurn = returnedThisTurn;
    io.to(gameId).emit('updateGameState', {
      game: gameData.game,
      thisMove: gameData.thisMove,
      thisTurn: gameData.thisTurn
    }); 
    }

  function startGame(gameId: string, GameDuration: number) {
    console.log(`startGame chiamata per gioco: ${gameId}`);
    const game = Game.new();
    game._gameOn = true;

    games[gameId] = {
      game,
      thisTurn: startingGame(game.clone(), io, gameId),
      thisMove: ThisMove.new(),
      players: { white: null, black: null },
      GameDuration: GameDuration,
      timers: { White: null, Black: null },
      timeLeft: { White: GameDuration, Black: GameDuration },
    };
    const thisturnplayer = games[gameId].thisTurn._turnPlayer._name === "White" ? "White" : "Black";
    io.to(gameId).emit("updateGameState", games[gameId]);
    startTurnTimer(gameId, thisturnplayer);
  }


  export function startTurnTimer(gameId: string, color: "White" | "Black") {
    console.log(`startTurnTimer chiamato per gioco ${gameId}, giocatore: ${color}`);
  
    const gameData = games[gameId];
    if (!gameData || !gameData.game._gameOn) {
      console.error(`Gioco ${gameId} non trovato o già terminato`);
      return;
    }
  
    const opponentColor = color === "White" ? "Black" : "White";
  
    // Cancella eventuali timer già attivi per evitare conflitti
    if (gameData.timers[color]) {
      console.log(`Cancello il timer precedente per ${color}`);
      clearInterval(gameData.timers[color]!);
      gameData.timers[color] = null;
    }
  
    // Verifica se il tempo rimanente è illimitato
    if (gameData.timeLeft[color] === -1) {
      console.log(`Il tempo per ${color} è illimitato, non avvio il timer`);
      return;
    }
  
    // Avvia un nuovo timer
    gameData.timers[color] = setInterval(() => {
      if (!gameData.game._gameOn) {
        clearInterval(gameData.timers[color]!);
        gameData.timers[color] = null;
        return;
      }
  
      if (gameData.thisTurn._turnPlayer._name !== color) {
        return;
      }
  
      const timeLeft = gameData.timeLeft[color];
  
      if (timeLeft > 0) {
        gameData.timeLeft[color] -= 1;
        
        // Emetti l'evento per aggiornare il client
       // Nel server, quando trasmetti il tempo
      io.to(gameId).emit("updateTimer", {
        color,
        timeLeft: gameData.timeLeft[color] !== Infinity ? gameData.timeLeft[color] : -1,
      });

  
        console.log(`Tempo aggiornato per ${color}: ${gameData.timeLeft[color]}`);
        
      } else if (timeLeft === 0) {
        clearInterval(gameData.timers[color]!);
        gameData.timers[color] = null;
        celebrateGameEnd(gameData.thisTurn, io, gameId,opponentColor);
        console.log(`Chiamata a endGame per ${gameId} con vincitore ${opponentColor}`);
        endGame(gameId, opponentColor);
      }
    }, 1000);
  }  

  

  function endGame(gameId: string, winnerColor: "White" | "Black") {
    const gameData = games[gameId];
    if (!gameData) return;

    io.to(gameId).emit("gameOver", { winner: winnerColor });

    if (gameData.timers.White) {
      clearInterval(gameData.timers.White);
      gameData.timers.White = null;
    }
    if (gameData.timers.Black) {
      clearInterval(gameData.timers.Black);
      gameData.timers.Black = null;
    }

    delete games[gameId];
    console.log(`Game ${gameId} terminato. Vincitore: ${winnerColor}`);
  }

  function select(index: number | string, socket: Socket, gameId: string) {
    const gameData = games[gameId];
    if (!gameData) return;

    const [updatedGame, updatedTurn, updatedMove] = selecting(
      index,
      gameData.game.clone(),
      gameData.thisTurn.clone(),
      gameData.thisMove.clone(),
      socket,
      io,
      gameId
    );

    gameData.game = updatedGame;
    gameData.thisTurn = updatedTurn;
    gameData.thisMove = updatedMove;

    io.to(gameId).emit("updateGameState",{
      game: gameData.game,
      thisMove: gameData.thisMove,
      thisTurn: gameData.thisTurn
    });
  }

  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on("createGame", ({ duration }) => {
      const gameId = `game-${Date.now()}`;
      const sanitizedDuration = duration > 0 ? duration : -1;
    
      games[gameId] = {
        game: Game.new(),
        thisTurn: ThisTurn.new(),
        thisMove: ThisMove.new(),
        players: { white: socket, black: null },
        GameDuration: sanitizedDuration,
        timers: { White: null, Black: null },
        timeLeft: {
          White: sanitizedDuration !== -1 ? sanitizedDuration : Infinity,
          Black: sanitizedDuration !== -1 ? sanitizedDuration : Infinity,
        },
      };
    
      socket.join(gameId);
      socket.emit("gameCreated", gameId);
      socket.emit("playerColor", "White");
      socket.emit("gameDuration", sanitizedDuration); // Invia la durata del gioco al client
    });
    
    socket.on("joinGame", (gameId) => {
      const gameData = games[gameId];
      if (!gameData) {
        socket.emit("error", "Game not found");
        return;
      }
    
      if (!gameData.players.white) {
        gameData.players.white = socket;
        socket.emit("playerColor", "White");
        socket.join(gameId);
        socket.emit("gameDuration", gameData.GameDuration); // Invia la durata del gioco al client
      } else if (!gameData.players.black) {
        gameData.players.black = socket;
        socket.emit("playerColor", "Black");
        socket.join(gameId);
    
        // Invia un aggiornamento dello stato del gioco a entrambi i giocatori
        io.to(gameId).emit("updateGameState", {
          game: gameData.game,
          thisMove: gameData.thisMove,
          thisTurn: gameData.thisTurn,
          timeLeft: gameData.timeLeft,
        });
    
        // Invia la durata del gioco al giocatore che si è unito
        socket.emit("gameDuration", gameData.GameDuration);
    
        console.log(`Giocatore ${socket.id} si è unito alla partita ${gameId} come Black`);
      } else {
        socket.emit("error", "Game is full");
      }
    });
    
    socket.on("findGame", ({gameDuration}) => {
      console.log(`Giocatore ${socket.id} sta cercando una partita`);
      
      // Aggiungi il giocatore alla coda di attesa solo se non è già presente
      const playerSocket = socket as Player;
      playerSocket.gameDuration = gameDuration; // Assign a default value or get it from the client
      if (!waitingPlayers.includes(playerSocket)) {
        waitingPlayers.push(playerSocket);
        console.log(`Giocatore ${socket.id} aggiunto alla coda di attesa. Numero di giocatori in coda: ${waitingPlayers.length}`);
      } else {
        console.log(`Giocatore ${socket.id} già presente nella coda.`);
      }
      // Richiama `matchmakePlayer` per cercare di abbinare i giocatori
      matchmakePlayer();
    });
    
    socket.on("stopSearching", ()=> {
      // Rimuovi il socket dalla coda di attesa se è presente
      console.log("rimuovo player dalla coda...");
      const index = waitingPlayers.indexOf(socket as Player);
      if (index !== -1) {
        waitingPlayers.splice(index, 1);
        console.log(`Giocatore ${socket.id} rimosso dalla coda di attesa`);
      }
    });

    socket.on("startGame", (gameId,gameDuration) => startGame(gameId,gameDuration));

    socket.on("rollDice", (gameId) => rollDice(socket, gameId));

    socket.on("select", (index, gameId) => select(index, socket, gameId));


    socket.on("disconnect", () => {
      console.log(`Giocatore disconnesso: ${socket.id}`);
    
      // Rimuovi il socket dalla coda di attesa se è presente
      const index = waitingPlayers.indexOf(socket as Player);
      if (index !== -1) {
        waitingPlayers.splice(index, 1);
        console.log(`Giocatore ${socket.id} rimosso dalla coda di attesa`);
      }
    
      // Pulizia dei giocatori disconnessi dai game esistenti
      for (const gameId in games) {
        const gameData = games[gameId];
        if (gameData.players.white?.id === socket.id) {
          gameData.players.white = null;
        } else if (gameData.players.black?.id === socket.id) {
          gameData.players.black = null;
        }
    
        // Elimina la partita se entrambi i giocatori sono disconnessi
        if (!gameData.players.white && !gameData.players.black) {
          delete games[gameId];
          console.log(`Game eliminato: ${gameId}`);
        }
      }
    });
    
  });

  server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
