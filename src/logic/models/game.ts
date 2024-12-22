import Player from "./player";

export default class Game {
  public _gameOn: boolean;
  public _board: string[][];
  public _whitePlayer: Player;
  public _blackPlayer: Player;

  constructor() {
    this._gameOn = false;
    this._board = Game.initialState();
    this._whitePlayer = new Player(
      "White",
      "⚪ WHITE ⚪",
      "WhiteOutBar",
      "WhiteEndBar",
      "White",
      "1px solid black"
    );
    this._blackPlayer = new Player(
      "Black",
      "⚫ BLACK ⚫",
      "BlackOutBar",
      "BlackEndBar",
      "Black",
      "1px solid #e9e2d6"
    );
  }

  public static new = () => new Game();

  public static initialState = () => [
    ["White", "White", "White", "White", "White"],
    [],
    [],
    [],
    ["Black", "Black", "Black"],
    [],
    ["Black", "Black", "Black", "Black", "Black"],
    [],
    [],
    [],
    [],
    ["White", "White"],
    ["Black", "Black", "Black", "Black", "Black"],
    [],
    [],
    [],
    ["White", "White", "White"],
    [],
    ["White", "White", "White", "White", "White"],
    [],
    [],
    [],
    [],
    ["Black", "Black"],
  ];

  
  public clone() {
    const newGame = new Game();
    newGame._gameOn = this._gameOn;
    newGame._board = [...this._board];
    newGame._whitePlayer = this._whitePlayer.clone();
    newGame._blackPlayer = this._blackPlayer.clone();

    return newGame;
  }
}
