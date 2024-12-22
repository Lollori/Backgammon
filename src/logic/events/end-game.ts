import { toast } from "react-hot-toast";
import { toastStyle } from "../../Client";
import Game from "../models/game";
import ThisTurn from "../models/this-turn";
import { Server } from "socket.io";

export function readyToEnd(game: Game, thisTurn: ThisTurn): boolean {
  const containing: number[] = [];

  game._board.map((bar, barIdx) => {
    if (bar.includes(thisTurn._turnPlayer._name)) containing.push(barIdx);
  });

  if (thisTurn._turnPlayer._name === "White") {
    for (let i = 0; i < containing.length; i++) {
      const barIdx = containing[i];

      if (barIdx < 18) return false;
    }
  } else {
    for (let i = 0; i < containing.length; i++) {
      const barIdx = containing[i];

      if (barIdx < 6 || barIdx > 11) return false;
    }
  }

  return true;
}

export function celebrateGameEnd(thisTurn: ThisTurn, io:Server, gameid: string, winner: string): void {
  if(io){
    io.to(gameid).emit("showToast", {
      message: `${winner} has Won the Game!`,
      style:toastStyle(thisTurn),
    });
  }
  else{
    toast(`${winner} has Won the Game!`, toastStyle(thisTurn));
  }

}
