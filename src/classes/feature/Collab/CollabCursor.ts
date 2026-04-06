import z from "zod";
import { playerPosition, type playerName } from "../../../types/wsZodSchemas";
import { useGrabToolPosition } from "../../../store/Tools.store";

type playerType = z.infer<typeof playerName>;
type playerPosition = z.infer<typeof playerPosition>;

let hue = 0;

function nextColor() {
  hue = (hue + 137.5) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}
function randomNiceColor() {
  return nextColor();
}
function bgFromColor() {
  return `hsl(${hue}, 40%, 90%)`;
}

export default class CollabCursor {
  //
  _player: playerType;
  _playerPosition: playerPosition;

  _color: string = randomNiceColor();
  _backgroundColor: string = bgFromColor();

  get player() {
    return this._player;
  }
  get playerPosition() {
    return this._playerPosition;
  }

  clone(): CollabCursor {
    return new CollabCursor(
      structuredClone(this._player),
      structuredClone(this._playerPosition),
    );
  }

  constructor(player: playerType, playerPosition: playerPosition) {
    this._player = player;
    this._playerPosition = playerPosition;
  }
  //
  setPlayer(player: playerType) {
    this._player = player;
  }
  setPlayerPosition(position: playerPosition) {
    this._playerPosition = position;
  }
  drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    headLength = 20,
  ) {
    let x2 = x1;
    let y2 = y1 + headLength;
    let x3 = x1 + headLength * Math.cos(Math.PI / 6);
    let y3 = y1 + headLength * Math.sin(Math.PI / 6);

    ctx.save();

    ctx.fillStyle = this._color;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.arcTo(x2, y2, x3, y3, headLength / 8);
    ctx.arcTo(x3, y3, x1, y1, headLength / 8);
    ctx.arcTo(x1, y1, x2, y2, headLength / 8);

    ctx.fill();

    ctx.restore();
  }
  draw(ctx: CanvasRenderingContext2D): void {
    //
    ctx.save();
    const { x: offsetX, y: offsetY } = useGrabToolPosition.getState();
    ctx.transform(1, 0, 0, 1, offsetX, offsetY);
    //
    ctx.beginPath();

    ctx.font = "14px Handwriting";
    ctx.fillStyle = this._backgroundColor;
    const measureText = ctx.measureText(this._player);

    this.drawArrow(ctx, this._playerPosition.x, this._playerPosition.y);

    ctx.beginPath();
    ctx.fillStyle = this._backgroundColor;
    ctx.roundRect(
      this._playerPosition.x + 15,
      this._playerPosition.y + 15,
      measureText.width + 10,
      30,
      5,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = this._color;
    ctx.fillText(
      this._player,
      this._playerPosition.x + 20,
      this._playerPosition.y + 35,
    );

    ctx.restore();
  }

  serialize(): any {
    return {
      player: this._player,
      playerPosition: this._playerPosition,
    };
  }

  static deserialize(serializedShape: any): CollabCursor {
    const { player, playerPosition } = serializedShape;

    let newShape = new CollabCursor(player, playerPosition);

    return newShape;
  }
}
