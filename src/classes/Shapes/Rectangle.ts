import type { Shape, ShapeType, shapeId } from "./Shape";

import {
  useToolStyle,
  type backgroundColor,
  type edgeRadius,
  type fillStyle,
  type opacity,
  type strokeColor,
  type strokeStyle,
  type strokeWidth,
} from "../../store/Tools.store";
import type { Point } from "./Point";
import {
  getBackgroundColorString,
  getStrokeColorString,
} from "../../utils/Theme";
import type ShapeManager from "../Managers/ShapeManager";
import type { updatePropertySchema } from "../../types/shapeUpdateEvents";

export class Rectangle implements Shape {
  readonly shapeId: shapeId = crypto.randomUUID();
  readonly shapeType: ShapeType = "rect";
  _shapeManager: ShapeManager;

  private _backgroundColor: backgroundColor;
  private _strokeColor: strokeColor;
  private _strokeWidth: strokeWidth;
  private _strokeStyle: strokeStyle;
  private _edgeRadius: edgeRadius;
  private _opacity: opacity;
  private _fillStyle: fillStyle;

  private _startX: number;
  private _startY: number;
  private _endX: number;
  private _endY: number;

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

  get backgroundColor() {
    return this._backgroundColor;
  }

  setBackgroundColor(color: backgroundColor) {
    this._backgroundColor = color;
    this.shapeManagerPropertyUpdate({ backgroundColor: color });
  }

  get strokeColor() {
    return this._strokeColor;
  }

  setStrokeColor(color: strokeColor) {
    this._strokeColor = color;
    this.shapeManagerPropertyUpdate({ strokeColor: color });
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  setStrokeWidth(width: strokeWidth) {
    this._strokeWidth = width;
    this.shapeManagerPropertyUpdate({ strokeWidth: width });
  }

  get strokeStyle() {
    return this._strokeStyle;
  }

  setStrokeStyle(style: strokeStyle) {
    this._strokeStyle = style;
    this.shapeManagerPropertyUpdate({ strokeStyle: style });
  }

  get edgeRadius() {
    return this._edgeRadius;
  }

  setEdgeRadius(radius: edgeRadius) {
    this._edgeRadius = radius;
    this.shapeManagerPropertyUpdate({ edgeRadius: radius });
  }

  get opacity() {
    return this._opacity;
  }

  setOpacity(opacity: opacity) {
    this._opacity = opacity;
    this.shapeManagerPropertyUpdate({ opacity: opacity });
  }

  get fillStyle() {
    return this._fillStyle;
  }

  setFillStyle(style: fillStyle) {
    this._fillStyle = style;
    this.shapeManagerPropertyUpdate({ fillStyle: style });
  }

  get startX() {
    return this._startX;
  }

  setStartX(v: number) {
    this._startX = v;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  get startY() {
    return this._startY;
  }

  setStartY(v: number) {
    this._startY = v;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  get endX() {
    return this._endX;
  }

  setEndX(v: number) {
    this._endX = v;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  get endY() {
    return this._endY;
  }

  setEndY(v: number) {
    this._endY = v;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  clone() {
    let rect = new Rectangle(
      this._startX,
      this._startY,
      this._endX,
      this._endY,
      this.shapeManager,
    );
    rect.setBackgroundColor(this._backgroundColor);
    rect.setFillStyle(this._fillStyle);
    rect.setOpacity(this._opacity);
    rect.setStrokeColor(this._strokeColor);
    rect.setStrokeWidth(this._strokeWidth);
    rect.setStrokeStyle(this._strokeStyle);
    return rect;
  }

  constructor(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    shapeMan: ShapeManager,
  ) {
    this._shapeManager = shapeMan;
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;

    let {
      backgroundColor,
      strokeColor,
      strokeWidth,
      strokeStyle,
      edgeRadius,
      opacity,
      fillStyle,
    } = useToolStyle.getState();

    this._backgroundColor = backgroundColor;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._strokeStyle = strokeStyle;
    this._edgeRadius = edgeRadius;
    this._opacity = opacity;
    this._fillStyle = fillStyle;
  }

  update(startX: number, startY: number, endX: number, endY: number) {
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  draw(ctx: CanvasRenderingContext2D) {
    let [x1, y1, x2, y2] = this.getEnclosingRectangle();

    if (x2 - x1 > this._edgeRadius && y2 - y1 > this._edgeRadius) {
      ctx.save();

      ctx.globalAlpha = this._opacity / 100.0;

      {
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        ctx.lineWidth = this._strokeWidth;
        ctx.strokeStyle = getStrokeColorString(this._strokeColor);

        ctx.moveTo(x1, y1 + this._edgeRadius);
        ctx.arcTo(x1, y2, x1 + this._edgeRadius, y2, this._edgeRadius);
        ctx.arcTo(x2, y2, x2, y2 - this._edgeRadius, this._edgeRadius);
        ctx.arcTo(x2, y1, x2 - this._edgeRadius, y1, this._edgeRadius);
        ctx.arcTo(x1, y1, x1, y1 + this._edgeRadius, this._edgeRadius);

        if (this._strokeStyle == "smalldotted") {
          ctx.setLineDash([4, 8]);
        } else if (this._strokeStyle == "dotted") ctx.setLineDash([8, 16]);

        ctx.stroke();

        ctx.restore();
      }
      let bgColor = getBackgroundColorString(this._backgroundColor);
      if (bgColor != "none") {
        ctx.save();

        if (this._fillStyle == "fill") {
          ctx.fillStyle = bgColor;
          ctx.fill();
        } else if (this._fillStyle == "line") {
          ctx.clip();
          ctx.lineWidth = 1;
          ctx.strokeStyle = bgColor;

          let d = Math.ceil(
            Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
          );
          ctx.beginPath();

          let gap = this._strokeWidth * 5;
          for (let pos = gap; pos < d * 2; pos += gap) {
            ctx.moveTo(x1 + pos, y1);
            ctx.lineTo(x1, y1 + pos);
          }
          ctx.stroke();
        } else if (this._fillStyle == "crosslines") {
          ctx.clip();
          ctx.lineWidth = 1;
          ctx.strokeStyle = bgColor;

          let d = Math.ceil(
            Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
          );
          ctx.beginPath();

          let gap = this._strokeWidth * 5;
          for (let pos = gap; pos < d * 2; pos += gap) {
            ctx.moveTo(x1 + pos, y1);
            ctx.lineTo(x1, y1 + pos);
          }
          for (let pos = gap; pos < d * 2; pos += gap) {
            ctx.moveTo(x2, y1 + pos);
            ctx.lineTo(x2 - pos, y1);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = Math.min(this._startX, this._endX);
    let x2 = Math.max(this._startX, this._endX);
    let y1 = Math.min(this._startY, this._endY);
    let y2 = Math.max(this._startY, this._endY);
    return [x1, y1, x2, y2];
  }

  updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {
    this._startX = x1;
    this._startY = y1;
    this._endX = x2;
    this._endY = y2;
    this.shapeManagerEnclosingRectangleUpdate();
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    this._startX += delX;
    this._endX += delX;
    this._startY += delY;
    this._endY += delY;
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
