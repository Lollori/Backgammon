import { toast } from "react-hot-toast";
import { toastStyle } from "../../Client";
import { calcMovesMade } from "../calculations/calc-moves-made";
import {
  calcEndingDiceBars,
  calcGettingOutOfOutMoves,
  calcPossibleMoves,
  checkCantMove,
} from "../calculations/calc-possible-moves";
import Game from "../models/game";
import ThisMove from "../models/this-move";
import ThisTurn from "../models/this-turn";
import { changeTurn } from "./change-turn";
import { readyToEnd } from "./end-game";
import { movingPiece } from "./moving";
import { Socket, Server } from "socket.io";

export function selecting(
  index: number | string,
  game: Game,
  thisTurn: ThisTurn,
  thisMove: ThisMove,
  socket: Socket,
  io: Server,
  gameid: string
): [Game, ThisTurn, ThisMove] {
  const newMove = () => new ThisMove();

  if (!game._gameOn) {
    if(socket){
      socket.emit("showToast", {
        message: "Begin a Game first!",
        style:toastStyle(thisTurn),
      });
    }
    else{
      toast("Begin a Game first!", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if (!thisTurn._rolledDice) {
    if(socket){
      socket.emit("showToast", {
        message: "Roll a dice first!",
        style:toastStyle(thisTurn),
      });
    }
    else{
      toast("Roll a dice first!", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if (
    thisTurn._turnPlayer._outBar.length == 0 &&
    index === thisTurn._turnPlayer._outBarIdx
  ) {



    if(socket){
      socket.emit("showToast", {
        message: "You have no pieces on out bar.",
        style:toastStyle(thisTurn),
      });
    }
    else{toast("You have no pieces on out bar.", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if (
    !thisTurn._turnPlayer._inTheEnd &&
    index === thisTurn._turnPlayer._endBarIdx
  ) {


    if(socket){
      socket.emit("showToast", {
        message: "You have no pieces on out bar.",
        style:toastStyle(thisTurn),
      });
    }
    else{toast(
      `You have not brought all your
      pieces to the ending area yet.`,
      toastStyle(thisTurn)
    );}
    
    return [game, thisTurn, thisMove];
  }
  if (
    thisMove._fromBarIdx === -1 &&
    typeof index === "number" &&
    game._board[index].length == 0
  ) {
    if(socket){
      socket.emit("showToast", {
        message: "You can't select an empty bar.",
        style: toastStyle(thisTurn),
      });
    } else {
      toast.error("You can't select an empty bar.", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if (
    typeof index === "number" &&
    game._board[index].includes(thisTurn._opponentPlayer._name) &&
    game._board[index].length > 1
  ) {
    if(socket){
      socket.emit("showToast", {
        message: "You can't select opponent's bar.",
        style: toastStyle(thisTurn),
      });
    } else {
      toast.error("You can't select opponent's bar.", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if (
    thisTurn._turnPlayer._outBar.length !== 0 &&
    thisMove._fromBarIdx !== thisTurn._turnPlayer._outBarIdx &&
    index !== thisTurn._turnPlayer._outBarIdx
  ) {
    if(socket){
      socket.emit("showToast", {
        message: `You have to play your out pieces first.`,
        style: toastStyle(thisTurn),
      });
    } else {
      toast.error(`You have to play your out pieces first.`, toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  // Deselecting 'from'
  if (index === thisMove._fromBarIdx) {
    thisMove = newMove();
    return [game, thisTurn, thisMove];
  }

  // Setting 'from' End Bar
  if (thisMove._fromBarIdx === -1 && index === thisTurn._turnPlayer._endBarIdx) {
    thisMove = settingFromEndBar(index, game, thisTurn, thisMove);
    return [game, thisTurn, thisMove];
  }

  // Setting 'from' Out Bar
  if (
    thisTurn._turnPlayer._outBar.length !== 0 &&
    index === thisTurn._turnPlayer._outBarIdx
  ) {
    thisMove = settingFromOutBar(index, game, thisTurn, thisMove);
    return [game, thisTurn, thisMove];
  }

  if (typeof index !== "number") {
    if(socket){
      socket.emit("showToast", {
        message: "You can't select opponent's bar.",
        style: toastStyle(thisTurn),
      });
    } else {
      toast.error("You can't select opponent's bar.", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  // Main Bars
  if (
    // Setting 'from' Main Bar
    thisMove._fromBarIdx === -1 &&
    game._board[index].includes(thisTurn._turnPlayer._name)
  ) {
    thisMove = settingFromBar(game, index, thisTurn, thisMove);
    return [game, thisTurn, thisMove];
  } else if (
    // Setting 'to' Bar for main, out, and end moves
    thisMove._toBarIdx === -1 &&
    thisMove._canGoTo.includes(index)
  ) {
    thisTurn = settingToBar(index, game, thisTurn, thisMove, io, gameid);
    thisMove = newMove();

    if (!thisTurn._turnPlayer._inTheEnd && readyToEnd(game, thisTurn)) {
      thisTurn._turnPlayer._inTheEnd = true;

      if(socket){
        socket.emit("showToast", {
          message: `${thisTurn._turnPlayer._icon} is in the ending area! Select your ending bar & start putting pieces out.`,
          style: toastStyle(thisTurn),
        });
      } else {
        toast.success(`${thisTurn._turnPlayer._icon} is in the ending area! Select your ending bar & start putting pieces out.`, toastStyle(thisTurn));
      }
    }

    if (thisTurn._maxMoves === 0) {
      thisTurn = changeTurn(game, thisTurn, io,gameid);
      return [game, thisTurn, thisMove];
    }

    if (thisTurn._rolledDice) {
      thisTurn = checkCantMove(game, thisTurn, io, gameid);
      return [game, thisTurn, thisMove];
    }
  } else {
    if(socket){
      socket.emit("showToast", {
        message: "You can't select there.",
        style: toastStyle(thisTurn),
      });
    } else {
      toast.error("You can't select there.", toastStyle(thisTurn));
    }
    return [game, thisTurn, thisMove];
  }

  if(socket){
    socket.emit("showToast", {
      message: "Why are you here?",
      style: toastStyle(thisTurn),
    });
  } else {
    toast("Why are you here?", toastStyle(thisTurn));
  }
  console.log(thisTurn);

  return [game, thisTurn, thisMove];
}



export function settingFromBar(
  game: Game,
  index: number,
  thisTurn: ThisTurn,
  thisMove: ThisMove
): ThisMove {
  const canGoTo = calcPossibleMoves(game, index, thisTurn);

  if (canGoTo.length !== 0) {
    thisMove._fromBarIdx = index;
    thisMove._canGoTo = canGoTo;
  } else {
    toast.error("You can't select there.", toastStyle(thisTurn));
  }

  return thisMove;
}

export function settingFromOutBar(
  index: string,
  game: Game,
  thisTurn: ThisTurn,
  thisMove: ThisMove
): ThisMove {
  thisMove._fromBarIdx = index;

  const canGoTo = calcGettingOutOfOutMoves(game, thisTurn);
  thisMove._canGoTo = canGoTo;

  return thisMove;
}

export function settingFromEndBar(
  index: string,
  game: Game,
  thisTurn: ThisTurn,
  thisMove: ThisMove
): ThisMove {
  if (readyToEnd(game, thisTurn)) {
    const endingDiceBars = calcEndingDiceBars(game, thisTurn);

    if (endingDiceBars.length !== 0) {
      thisMove._fromBarIdx = index;
      thisMove._canGoTo = endingDiceBars;
      return thisMove;
    } else {
      toast.error("You can't select there.", toastStyle(thisTurn));
    }
  }

  return thisMove;
}

export function settingToBar(
  index: number,
  game: Game,
  thisTurn: ThisTurn,
  thisMove: ThisMove,
  io: Server,
  gameId: string
): ThisTurn {
  thisMove._toBarIdx = index;
  movingPiece(game, thisTurn, thisMove, io, gameId);

  thisTurn = calcMovesMade(thisTurn, thisMove);

  return thisTurn;
}
