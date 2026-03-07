import type { Shape, ShapeType } from "./Shape";
import { Point } from "./Point";

import {
  useToolStyle,
  type arrowType,
  type opacity,
  type strokeColor,
  type strokeStyle,
  type strokeWidth,
} from "../../store/Tools.store";
import { catmullRomToBezier } from "../../utils/Line";

export class Arrow implements Shape {
  shapeType: ShapeType = "arrow";
  // style properties
  strokeColor: strokeColor;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  opacity: opacity;
  arrowType: arrowType;

  // shape definition

  points: Point[];

  constructor(points: Point[]) {
    this.points = points;

    let { strokeColor, strokeWidth, strokeStyle, opacity, arrowType } =
      useToolStyle.getState();

    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle;
    this.opacity = opacity;
    this.arrowType = arrowType;
  }
  setStrokeColor(color: strokeColor) {
    this.strokeColor = color;
  }

  setStrokeWidth(width: strokeWidth) {
    this.strokeWidth = width;
  }

  setStrokeStyle(style: strokeStyle) {
    this.strokeStyle = style;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }

  setArrowType(arrowType: arrowType) {
    this.arrowType = arrowType;
  }

  update(points: Point[]) {
    this.points = points;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (
      this.points.length < 2 ||
      (this.points.length == 2 &&
        Point.isSamePoint(this.points[0], this.points[1]))
    )
      return;

    ctx.save();

    //
    {
      ctx.globalAlpha = this.opacity / 100;

      ctx.save();
      {
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;

        {
          ctx.save();

          if (this.strokeStyle == "smalldotted") ctx.setLineDash([4, 8]);
          else if (this.strokeStyle == "dotted") ctx.setLineDash([8, 16]);

          ctx.beginPath();

          if (this.arrowType == "straight") {
            ctx.moveTo(this.points[0].x, this.points[0].y);
            let len = this.points.length;

            for (let i = 1; i < len; i++) {
              ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
              ctx.lineTo(this.points[i].x, this.points[i].y);
            }
          } else if (this.arrowType == "curve") {
            //
            ctx.moveTo(this.points[0].x, this.points[0].y);

            let points = [
              this.points[0],
              ...this.points,
              this.points[this.points.length - 1],
            ];
            for (let i = 1; i < points.length - 2; i++) {
              //
              let p0 = points[i - 1];
              let p1 = points[i];
              let p2 = points[i + 1];
              let p3 = points[i + 2];

              let [b0, b1, b2, b3] = catmullRomToBezier(p0, p1, p2, p3);
              ctx.bezierCurveTo(b1.x, b1.y, b2.x, b2.y, b3.x, b3.y);
            }
          } else if (this.arrowType == "snake") {
            //
            let a = this.points[0];
            ctx.moveTo(a.x, a.y);

            for (let i = 0; i < this.points.length - 2; i++) {
              let b = this.points[i + 1];
              let c = this.points[i + 2];

              let check = Math.floor(
                Math.min(Math.abs(a.x - c.x), Math.abs(a.y - c.y)),
              );

              ctx.arcTo(b.x, b.y, c.x, c.y, check < 20 ? 0 : 10);
            }
            let len = this.points.length;
            ctx.lineTo(this.points[len - 1].x, this.points[len - 1].y);
          }
          ctx.stroke();
          ctx.restore();
        }
        // draw arrow

        let len = this.points.length;
        let a = this.points[len - 2];
        let b = this.points[len - 1];
        //
        let opposite = b.x < a.x ? -1 : 1;

        let theta = Math.atan((b.y - a.y) / (b.x - a.x));
        let alpha = theta - Math.PI / 6;
        let beta = theta + Math.PI / 6;

        let dis = 20 * opposite;

        let dx1 = dis * Math.cos(alpha);
        let dy1 = dis * Math.sin(alpha);
        let dx2 = dis * Math.cos(beta);
        let dy2 = dis * Math.sin(beta);

        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - dx1, b.y - dy1);
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - dx2, b.y - dy2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;
    for (let point of this.points) {
      x1 = Math.min(x1, point.x);
      x2 = Math.max(x2, point.x);
      y1 = Math.min(y1, point.y);
      y2 = Math.max(y2, point.y);
    }
    return [x1, y1, x2, y2];
  }

  updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {
    let [sx, sy, bx, by] = this.getEnclosingRectangle();
    let xdis = bx - sx;
    let ydis = by - sy;

    let newxdis = x2 - x1;
    let newydis = y2 - y1;

    this.points.forEach((point) => {
      point.x = ((point.x - sx) * newxdis) / xdis;
      point.y = ((point.y - sy) * newydis) / ydis;
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
