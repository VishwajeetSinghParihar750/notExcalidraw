import type { Shape, shapeId, ShapeType } from "./Shape";

import {
  useToolStyle,
  type opacity,
  type strokeColor,
  type fontFamily,
  type fontSize,
} from "../../store/Tools.store";
import type { Point } from "./Point";
import { getStrokeColorString } from "../../utils/Theme";
import type ShapeManager from "../Managers/ShapeManager";
import type { updatePropertySchema } from "../../types/shapeUpdateEvents";

export type TextShapeState = "render" | "edit";

export class Text implements Shape {
  readonly shapeType: ShapeType = "text";
  readonly shapeId: shapeId = crypto.randomUUID();
  _shapeManager: ShapeManager;

  private _strokeColor: strokeColor;
  private _opacity: opacity;
  private _fontFamily: fontFamily;
  private _fontSize: fontSize;

  private _curState: TextShapeState;
  private _text: string;

  private _shouldUpdateRectangleBasedOnText = false;

  private _enclosingRectangle: [Point, Point];

  private shapeManagerPropertyUpdate(payload: updatePropertySchema) {
    this.shapeManager.handleShapeUpdateEvent({
      eventType: "updateProperty",
      shapeId: this.shapeId,
      payload,
    });
  }

  private shapeManagerEnclosingRectangleUpdate() {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    this.shapeManager.handleShapeUpdateEvent({
      eventType: "updateEnclosingRectangle",
      shapeId: this.shapeId,
      payload: { x1: sx, y1: sy, x2: ex, y2: ey },
    });
  }

  get shapeManager() {
    return this._shapeManager;
  }
  get strokeColor() {
    return this._strokeColor;
  }

  setStrokeColor(color: strokeColor) {
    this._strokeColor = color;
  }

  get opacity() {
    return this._opacity;
  }

  setOpacity(opacity: opacity) {
    this._opacity = opacity;
    this.shapeManagerPropertyUpdate({ opacity });
  }

  get fontFamily() {
    return this._fontFamily;
  }

  setFontFamily(fontFamily: fontFamily) {
    this._fontFamily = fontFamily;
    this._shouldUpdateRectangleBasedOnText = true;
    this.shapeManagerPropertyUpdate({ fontFamily });
  }

  get fontSize() {
    return this._fontSize;
  }

  setFontSize(fontSize: fontSize) {
    this._fontSize = fontSize;
    this._shouldUpdateRectangleBasedOnText = true;
    this.shapeManagerPropertyUpdate({ fontSize });
  }

  get curState() {
    return this._curState;
  }

  setCurState(curState: TextShapeState) {
    this._curState = curState;

    this.shapeManagerPropertyUpdate({ curState });
  }

  get text() {
    return this._text;
  }

  setText(text: string) {
    this._text = text;
    this._shouldUpdateRectangleBasedOnText = true;
    this.shapeManagerPropertyUpdate({ text });
  }

  get shouldUpdateRectangleBasedOnText() {
    return this._shouldUpdateRectangleBasedOnText;
  }

  getEnclosingRectangle(): [number, number, number, number] {
    return [
      this._enclosingRectangle[0].x,
      this._enclosingRectangle[0].y,
      this._enclosingRectangle[1].x,
      this._enclosingRectangle[1].y,
    ];
  }

  clone() {
    let text = new Text(
      structuredClone(this._curState),
      structuredClone(this._text),
      structuredClone(this._enclosingRectangle),
      this.shapeManager,
    );
    text.setStrokeColor(this._strokeColor);
    text.setOpacity(this._opacity);
    text.setFontFamily(this._fontFamily);
    text.setFontSize(this._fontSize);
    return text;
  }

  constructor(
    curState: TextShapeState,
    text: string,
    enclosingRectangle: [Point, Point],
    shapeMan: ShapeManager,
  ) {
    this._shapeManager = shapeMan;
    let { strokeColor, opacity, fontFamily, fontSize } =
      useToolStyle.getState();

    this._enclosingRectangle = enclosingRectangle;

    this._curState = curState;
    this._text = text;

    this._strokeColor = strokeColor;
    this._opacity = opacity;
    this._fontFamily = fontFamily;
    this._fontSize = fontSize;
  }

  updateRectangleFromText(ctx: CanvasRenderingContext2D) {
    ctx.save();
    let pixelFontSize =
      typeof this._fontSize === "number"
        ? this._fontSize
        : this._fontSize === "small"
          ? 16
          : this._fontSize === "medium"
            ? 24
            : this._fontSize === "large"
              ? 32
              : 40;

    let lineHeight = pixelFontSize * 1.2;

    switch (this._fontFamily) {
      case "hand":
        ctx.font = `${pixelFontSize}px Handwriting`;
        break;
      case "code":
        ctx.font = `${pixelFontSize}px Code`;
        break;
      case "normal":
        ctx.font = `${pixelFontSize}px sans-serif`;
        break;
    }

    const lines = this._text.split("\n");

    let maxWidth = 0;

    for (let line of lines) {
      let w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    }

    let height = lines.length * lineHeight;

    let startPoint = {
      x: this._enclosingRectangle[0].x,
      y: this._enclosingRectangle[0].y,
    };
    this.setEnclosingRectangleCoordinates(
      startPoint.x,
      startPoint.y,
      startPoint.x + maxWidth,
      startPoint.y + height,
    );

    ctx.restore();
    this._shouldUpdateRectangleBasedOnText = false;
  }

  setEnclosingRectangleCoordinates(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    this._enclosingRectangle[0].x = x1;
    this._enclosingRectangle[1].x = x2;
    this._enclosingRectangle[0].y = y1;
    this._enclosingRectangle[1].y = y2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this._curState != "render") return;

    ctx.save();

    if (this._shouldUpdateRectangleBasedOnText)
      this.updateRectangleFromText(ctx);

    {
      ctx.globalAlpha = this._opacity / 100;

      let lineHeight = 0;
      let pixelFontSize = 10;
      switch (this._fontSize) {
        case "small":
          pixelFontSize = 16;
          break;
        case "medium":
          pixelFontSize = 24;
          break;
        case "large":
          pixelFontSize = 32;
          break;
        case "extra-large":
          pixelFontSize = 40;
          break;

        default:
          pixelFontSize = this._fontSize as number;
          break;
      }
      lineHeight = pixelFontSize * 1.2;

      switch (this._fontFamily) {
        case "hand":
          ctx.font = `${pixelFontSize}px Handwriting`;
          break;

        case "code":
          ctx.font = `${pixelFontSize}px Code`;
          break;

        case "normal":
          ctx.font = `${pixelFontSize}px sans-serif`;
          break;

        default:
          break;
      }

      ctx.beginPath();
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const lines = this._text.split("\n");
      ctx.fillStyle = getStrokeColorString(this._strokeColor);

      let startPoint = {
        x: this._enclosingRectangle[0].x,
        y: this._enclosingRectangle[0].y,
      };
      lines.forEach((line, ind) => {
        ctx.fillText(line, startPoint.x, startPoint.y + ind * lineHeight);
      });
    }

    ctx.restore();
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    this._enclosingRectangle[0].x += delX;
    this._enclosingRectangle[1].x += delX;
    this._enclosingRectangle[0].y += delY;
    this._enclosingRectangle[1].y += delY;

    this.shapeManagerEnclosingRectangleUpdate();
  }

  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    const lines = this._text.split("\n").length;
    let lineHeight = (ney - nsy) / lines;
    let fontsizevalue = lineHeight / 1.2;

    this.setFontSize(fontsizevalue);
    this.setEnclosingRectangleCoordinates(nsx, nsy, nex, ney);

    this.shapeManagerEnclosingRectangleUpdate();
  }

  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && y >= sy && y <= ey;
  }

  liesInside(point1: Point, point2: Point) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    let minx = Math.min(point1.x, point2.x);
    let miny = Math.min(point1.y, point2.y);
    let maxx = Math.max(point1.x, point2.x);
    let maxy = Math.max(point1.y, point2.y);

    return sx >= minx && ex <= maxx && sy >= miny && ey <= maxy;
  }
}
