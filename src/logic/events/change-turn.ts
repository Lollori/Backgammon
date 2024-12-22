import { toast } from "react-hot-toast";
import { toastStyle } from "../../Client";
import Game from "../models/game";
import ThisTurn from "../models/this-turn";
import { Server } from "socket.io";
import { startTurnTimer } from "../../online/server";

export function changeTurn(game: Game, thisTurn: ThisTurn, io: Server, gameid: string): ThisTurn {
  if (game._gameOn) {
    thisTurn = changingTurn(thisTurn, io, gameid);
  }

  return thisTurn;
}

export function changingTurn(oldTurn: ThisTurn, io : Server, gameid: string): ThisTurn {
  const thisTurn = new ThisTurn(
    oldTurn._opponentPlayer,
    oldTurn._turnPlayer,
    [],
    false
  );

  const message = `Turn is now ${thisTurn._turnPlayer._icon}`;
  const playerColor = thisTurn._turnPlayer._name as "White" | "Black";
  startTurnTimer(gameid, playerColor);
  if(io){
    io.to(gameid).emit("showToast", {
      message: message,
      style:toastStyle(thisTurn),
    });
  }
  else{
  toast.success(message, toastStyle(thisTurn));
  }

  return thisTurn;
}
