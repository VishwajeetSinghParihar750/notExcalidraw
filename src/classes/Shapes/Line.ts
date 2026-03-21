import type { Shape, ShapeType, shapeId } from "./Shape";
import { isSamePoint } from "./Point";
import type { Point } from "./Point";
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
import { catmullRomToBezier } from "../../utils/Line";
import {
  getBackgroundColorString,
  getStrokeColorString,
} from "../../utils/Theme";

export class Line implements Shape {
  readonly shapeId: shapeId = crypto.randomUUID();
  readonly shapeType: ShapeType = "line";

  private _backgroundColor: backgroundColor;
  private _strokeColor: strokeColor;
  private _strokeWidth: strokeWidth;
  private _strokeStyle: strokeStyle;
  private _edgeRadius: edgeRadius;
  private _opacity: opacity;
  private _fillStyle: fillStyle;

  private _points: Point[];

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

  get points() {
    return structuredClone(this._points);
  }

  setPoints(points: Point[]) {
    this._points = points;
  }

  clone() {
    let line = new Line(structuredClone(this._points));
    line.setBackgroundColor(this._backgroundColor);
    line.setEdgeRadius(this._edgeRadius);
    line.setFillStyle(this._fillStyle);
    line.setOpacity(this._opacity);
    line.setStrokeColor(this._strokeColor);
    line.setStrokeWidth(this._strokeWidth);
    line.setStrokeStyle(this._strokeStyle);
    return line;
  }

  constructor(points: Point[]) {
    this._points = points;

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

  draw(ctx: CanvasRenderingContext2D) {
    if (
      this._points.length < 2 ||
      (this._points.length == 2 &&
        isSamePoint(this._points[0], this._points[1]))
    )
      return;

    ctx.save();

    {
      ctx.globalAlpha = this._opacity / 100;

      {
        ctx.save();

        ctx.strokeStyle = getStrokeColorString(this._strokeColor);
        ctx.lineWidth = this._strokeWidth;

        if (this._strokeStyle == "smalldotted") ctx.setLineDash([4, 8]);
        else if (this._strokeStyle == "dotted") ctx.setLineDash([8, 16]);

        ctx.beginPath();

        if (this._edgeRadius == 0) {
          ctx.moveTo(this._points[0].x, this._points[0].y);
          let len = this._points.length;

          for (let i = 1; i < len; i++) {
            ctx.lineTo(this._points[i].x, this._points[i].y);
          }
          ctx.stroke();
        } else {
          ctx.moveTo(this._points[0].x, this._points[0].y);

          let points = [
            this._points[0],
            ...this._points,
            this._points[this._points.length - 1],
          ];
          for (let i = 1; i < points.length - 2; i++) {
            let p0 = points[i - 1];
            let p1 = points[i];
            let p2 = points[i + 1];
            let p3 = points[i + 2];

            let [_, b1, b2, b3] = catmullRomToBezier(p0, p1, p2, p3);
            ctx.bezierCurveTo(b1.x, b1.y, b2.x, b2.y, b3.x, b3.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      let bgColor = getBackgroundColorString(this._backgroundColor);
      if (
        bgColor != "none" &&
        this._points.length > 2 &&
        isSamePoint(this._points[0], this._points[this._points.length - 1])
      ) {
        ctx.save();

        if (this._fillStyle == "fill") {
          ctx.fillStyle = bgColor;
          ctx.fill();
        } else if (this._fillStyle == "line") {
          let [x1, y1, x2, y2] = this.getEnclosingRectangle();
          x1 /= 2;
          y1 /= 2;
          x2 *= 2;
          y2 *= 2;

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

          let [x1, y1, x2, y2] = this.getEnclosingRectangle();
          x1 /= 2;
          y1 /= 2;
          x2 *= 2;
          y2 *= 2;
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
    }

    ctx.restore();
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
