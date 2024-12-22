export default class ThisMove {
  public _fromBarIdx: number | string;
  public _toBarIdx: number;
  public _canGoTo: number[];

  constructor() {
    this._fromBarIdx = -1;
    this._toBarIdx = -1;
    this._canGoTo = [];
  }

  public static new = () => new ThisMove();

  public clone() {
    const newThisMove = new ThisMove();
    newThisMove._fromBarIdx = this._fromBarIdx;
    newThisMove._toBarIdx = this._toBarIdx;
    newThisMove._canGoTo = [...this._canGoTo];

    return newThisMove;
  }
}
