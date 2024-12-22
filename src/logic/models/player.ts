export default class Player {
  public _outBar: string[];
  public _endBar: string[];
  public _inTheEnd: boolean;

  constructor(
    public readonly _name: string,
    public readonly _icon: string,
    public readonly _outBarIdx: string,
    public readonly _endBarIdx: string,
    public readonly _pieceColor: string,
    public readonly _pieceBorderColor: string
  ) {
    this._outBar = [];
    this._endBar = [];
    this._inTheEnd = false;
  }

  public static new = () => new Player("", "", "", "", "", "");


  public clone() {
    const newPlayer = new Player(
      this._name,
      this._icon,
      this._outBarIdx,
      this._endBarIdx,
      this._pieceColor,
      this._pieceBorderColor
    );

    newPlayer._outBar = [...this._outBar];
    newPlayer._endBar = [...this._endBar];
    newPlayer._inTheEnd = this._inTheEnd;

    return newPlayer;
  }
}
