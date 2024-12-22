import Player from "./player";

export default class ThisTurn {
  public _rolledDice: boolean = false;
  public _maxMoves: number = 0;
  public _movesMade: number = 0;

  constructor(
    public readonly _turnPlayer: Player,
    public readonly _opponentPlayer: Player,
    public _dices: number[],
    public _beginning: boolean
  ) {
    if (_beginning && _dices.length === 2) {
      if (this._maxMoves === 0 && this._dices[0] === this._dices[1]) {
        this._dices.push(this._dices[0]);
        this._dices.push(this._dices[0]);
      }
      this._beginning = false;
      this._rolledDice = true;
      this._maxMoves = this._dices.reduce((a, b) => a + b, 0);
      this._movesMade = 0;
    } else {
      this._rolledDice = false;
      this._maxMoves = 0;
      this._movesMade = 0;
    }
  }

  public static new = () => new ThisTurn(Player.new(), Player.new(), [], false);


  public clone() {
    const newThisTurn = new ThisTurn(
      this._turnPlayer,
      this._opponentPlayer,
      this._dices,
      false
    );

    newThisTurn._rolledDice = this._rolledDice;
    newThisTurn._maxMoves = this._maxMoves;
    newThisTurn._movesMade = this._movesMade;

    return newThisTurn;
  }
}
