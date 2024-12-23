import { toast } from "react-hot-toast";
import { toastStyle } from "../../Client";
import { dice } from "./roll-dice";
import Game from "../models/game";
import ThisTurn from "../models/this-turn";
import { Server } from "socket.io";

export function backgammon() {
  toast(
    `Backgammon...
  
  Is the oldest game in the world. Archaeologists found sets
  when they excavated the ruins
  of ancient Mesopotamia,
  five thousand years old. 

  That's older than Jesus Christ. 
  Their dice were made of bones.
  
  Two Players. Two Sides.

  One is Light, 
  One is Dark.

  -  John Locke. Lost.`,
    {
      duration: 9000,
      style: {
        borderRadius: "10px",
        background: "black",
        color: "#fff",
        border: "2px solid white",
      },
    }
  );
}

export function startingGame(game: Game, io: Server, gameid: string): ThisTurn {
  var thisTurn: ThisTurn;

  while (true) {
    const [whiteFirst, whiteSecond] = dice();
    const [blackFirst, blackSecond] = dice();

    if (whiteFirst + whiteSecond > blackFirst + blackSecond) {
      thisTurn = new ThisTurn(game._whitePlayer, game._blackPlayer, [], false);
      
      if(io){
      // Invia il toast al client tramite socket.io
      io.to(gameid).emit("showToast", {
        message: "Game starts with ⚪ WHITE ⚪",
        style:toastStyle(thisTurn),
      });
    }
    else{
      toast.success("Game starts with ⚪ WHITE ⚪", toastStyle(thisTurn));
    }
      break;
    } else if (whiteFirst + whiteSecond < blackFirst + blackSecond) {
      thisTurn = new ThisTurn(game._blackPlayer, game._whitePlayer, [], false);
      

      if(io){
      // Invia il toast al client tramite socket.io
      io.to(gameid).emit("showToast", {
        message: "Game starts with ⚫ BLACK ⚫",
        style: toastStyle(thisTurn)
      });
    }
    else{
      toast.success("Game starts with ⚫ BLACK ⚫", toastStyle(thisTurn));
    }
      break;
    }
  }

  return thisTurn;
}
