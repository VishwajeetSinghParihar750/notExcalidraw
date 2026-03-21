import type { Shape, ShapeType, shapeId } from "./Shape";

import {
  useToolStyle,
  type backgroundColor,
  type fillStyle,
  type opacity,
  type strokeColor,
  type strokeWidth,
} from "../../store/Tools.store";
import { isSamePoint } from "./Point";
import type { Point } from "./Point";
import {
  getBackgroundColorString,
  getStrokeColorString,
} from "../../utils/Theme";

export class Pen implements Shape {
  readonly shapeType: ShapeType = "pen";
  readonly shapeId: shapeId = crypto.randomUUID();

  private _backgroundColor: backgroundColor;
  private _strokeColor: strokeColor;
  private _strokeWidth: strokeWidth;
  private _opacity: opacity;
  private _fillStyle: fillStyle;

  private _points: Point[] = [];

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

  get points() {
    return structuredClone(this._points);
  }

  setPoints(points: Point[]) {
    this._points = points;
  }

  clone() {
    let pen = new Pen(structuredClone(this._points));
    pen.setFillStyle(this._fillStyle);
    pen.setOpacity(this._opacity);
    pen.setStrokeColor(this._strokeColor);
    pen.setStrokeWidth(this._strokeWidth);
    pen.setBackgroundColor(this._backgroundColor);
    return pen;
  }

  constructor(points: Point[]) {
    this._points = points;

    let { backgroundColor, strokeColor, strokeWidth, opacity, fillStyle } =
      useToolStyle.getState();

    this._backgroundColor = backgroundColor;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._opacity = opacity;
    this._fillStyle = fillStyle;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    {
      ctx.globalAlpha = this._opacity / 100;
      ctx.strokeStyle = getStrokeColorString(this._strokeColor);

      let len = this._points.length - 1;

      if (len > 0) {
        {
          ctx.beginPath();

          ctx.lineWidth = this._strokeWidth * 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(this._points[0].x, this._points[0].y);

          for (let i = 1; i < len; i++) {
            ctx.lineTo(this._points[i].x, this._points[i].y);
          }

          ctx.stroke();
        }
        let bgColor = getBackgroundColorString(this._backgroundColor);
        if (
          bgColor != "none" &&
          isSamePoint(this._points[0], this._points[len - 1])
        ) {
          ctx.save();
          let [x1, y1, x2, y2] = this.getEnclosingRectangle();

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
      } else if (len == 0) {
        ctx.beginPath();
        ctx.arc(
          this._points[0].x,
          this._points[0].y,
          this._strokeWidth,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = getStrokeColorString(this._strokeColor);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    for (let point of this._points) {
      point.x += delX;
      point.y += delY;
    }
  }

  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    this._points.forEach((point) => {
      let x1 = point.x;
      let y1 = point.y;

      x1 = nsx + ((x1 - sx) * (nex - nsx)) / (ex - sx);
      y1 = nsy + ((y1 - sy) * (ney - nsy)) / (ey - sy);

      point.x = x1;
      point.y = y1;
    });
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;
    for (let point of this._points) {
      x1 = Math.min(x1, point.x);
      x2 = Math.max(x2, point.x);
      y1 = Math.min(y1, point.y);
      y2 = Math.max(y2, point.y);
    }
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
