import { toast } from "react-hot-toast";
import { toastStyle } from "../../Client";
import ThisTurn from "../models/this-turn";
import { Server } from "socket.io";

export function dice(): number[] {
  const first = Math.floor(Math.random() * 6) + 1;
  const second = Math.floor(Math.random() * 6) + 1;

  return [first, second];
}

export function rollingDice(tempTurn: ThisTurn, io:Server, gameid: string) {
  const thisTurn = new ThisTurn(
    tempTurn._turnPlayer,
    tempTurn._opponentPlayer,
    dice(),
    true
  );

  if (thisTurn._dices[0] === thisTurn._dices[1]) {
    if(io){
      io.to(gameid).emit("showToast", {
        message: `${thisTurn._turnPlayer._icon}
      🎲 Rolled a double ${thisTurn._dices} 🎲`,
        style: toastStyle(thisTurn),
      });
    }
    else{
      toast(
        `${thisTurn._turnPlayer._icon}
        🎲 Rolled a double ${thisTurn._dices} 🎲`,
        toastStyle(thisTurn)
      );
    }
    
  } else {


    if(io){
      io.to(gameid).emit("showToast", {
        message: `${thisTurn._turnPlayer._icon}
      🎲 Rolled ${thisTurn._dices} 🎲`,
        style: toastStyle(thisTurn),
      });
    }
    else{toast(
      `${thisTurn._turnPlayer._icon}
      🎲 Rolled ${thisTurn._dices} 🎲`,
      toastStyle(thisTurn)
    );} 
  }
  return thisTurn;
}
