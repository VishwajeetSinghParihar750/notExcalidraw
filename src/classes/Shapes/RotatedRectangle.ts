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

export class RotatedRecangle implements Shape {
  readonly shapeId: shapeId = crypto.randomUUID();
  readonly shapeType: ShapeType = "rotrect";

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

  get backgroundColor() {
    return this._backgroundColor;
  }

  setBackgroundColor(color: backgroundColor) {
    this._backgroundColor = color;
  }

  get strokeColor() {
    return this._strokeColor;
  }

  setStrokeColor(color: strokeColor) {
    this._strokeColor = color;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  setStrokeWidth(width: strokeWidth) {
    this._strokeWidth = width;
  }

  get strokeStyle() {
    return this._strokeStyle;
  }

  setStrokeStyle(style: strokeStyle) {
    this._strokeStyle = style;
  }

  get edgeRadius() {
    return this._edgeRadius;
  }

  setEdgeRadius(radius: edgeRadius) {
    this._edgeRadius = radius;
  }

  get opacity() {
    return this._opacity;
  }

  setOpacity(opacity: opacity) {
    this._opacity = opacity;
  }

  get fillStyle() {
    return this._fillStyle;
  }

  setFillStyle(style: fillStyle) {
    this._fillStyle = style;
  }

  get startX() {
    return this._startX;
  }

  setStartX(v: number) {
    this._startX = v;
  }

  get startY() {
    return this._startY;
  }

  setStartY(v: number) {
    this._startY = v;
  }

  get endX() {
    return this._endX;
  }

  setEndX(v: number) {
    this._endX = v;
  }

  get endY() {
    return this._endY;
  }

  setEndY(v: number) {
    this._endY = v;
  }

  clone() {
    let rect = new RotatedRecangle(
      this._startX,
      this._startY,
      this._endX,
      this._endY,
    );
    rect.setBackgroundColor(this._backgroundColor);
    rect.setFillStyle(this._fillStyle);
    rect.setOpacity(this._opacity);
    rect.setStrokeColor(this._strokeColor);
    rect.setStrokeWidth(this._strokeWidth);
    rect.setStrokeStyle(this._strokeStyle);
    return rect;
  }

  constructor(startX: number, startY: number, endX: number, endY: number) {
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
  }

  draw(ctx: CanvasRenderingContext2D) {
    let [x1, y1, x2, y2] = this.getEnclosingRectangle();

    ctx.save();

    ctx.globalAlpha = this._opacity / 100;

    {
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      ctx.lineWidth = this._strokeWidth;
      ctx.strokeStyle = getStrokeColorString(this._strokeColor);

      {
        let [x1, y1, x2, y2, x3, y3, x4, y4] = this.getShape();

        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

        if (x2 - x1 > this._edgeRadius && y2 - y1 > this._edgeRadius) {
          let ux = dx / len;
          let uy = dy / len;

          let beginx;
          let beginy;
          if (Math.abs(dx) > Math.abs(dy)) {
            beginx = x1 + ux * this._edgeRadius;
            beginy = y1 + uy * this._edgeRadius;
          } else {
            beginx = x2 - ux * this._edgeRadius;
            beginy = y2 - uy * this._edgeRadius;
          }

          ctx.moveTo(beginx, beginy);

          ctx.arcTo(x2, y2, x3, y3, this._edgeRadius);
          ctx.arcTo(x3, y3, x4, y4, this._edgeRadius);
          ctx.arcTo(x4, y4, x1, y1, this._edgeRadius);
          ctx.arcTo(x1, y1, x2, y2, this._edgeRadius);
          ctx.lineTo(beginx, beginy);
        }
      }

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

  getShape(): [number, number, number, number, number, number, number, number] {
    let [x1, y1, x2, y2] = this.getEnclosingRectangle();
    return [
      (x1 + x2) / 2,
      y1,
      x2,
      (y1 + y2) / 2,
      (x1 + x2) / 2,
      y2,
      x1,
      (y1 + y2) / 2,
    ];
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    this._startX += delX;
    this._endX += delX;
    this._startY += delY;
    this._endY += delY;
  }

  updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {
    this._startX = x1;
    this._startY = y1;
    this._endX = x2;
    this._endY = y2;
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = Math.min(this._startX, this._endX);
    let x2 = Math.max(this._startX, this._endX);
    let y1 = Math.min(this._startY, this._endY);
    let y2 = Math.max(this._startY, this._endY);
    return [x1, y1, x2, y2];
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
