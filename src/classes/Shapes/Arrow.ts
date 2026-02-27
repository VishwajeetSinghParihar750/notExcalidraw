import type { Shape } from "./Shape";
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
          ctx.stroke();
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
          ctx.stroke();
        } else if (this.arrowType == "snake") {
          //
          let startPoint = this.points[0];
          let endPoint = this.points[this.points.length - 1];

          //
        }
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
  containsPoint(x: number, y: number) {
    return true;
  }
}
