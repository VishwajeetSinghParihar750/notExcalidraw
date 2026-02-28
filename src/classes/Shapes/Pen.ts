import type { Shape } from "./Shape";

import {
  useToolStyle,
  type backgroundColor,
  type fillStyle,
  type opacity,
  type strokeColor,
  type strokeWidth,
} from "../../store/Tools.store";
import { Point } from "./Point";
import { catmullRomToBezier } from "../../utils/Line";

export class Pen implements Shape {
  // style properties
  backgroundColor: backgroundColor;
  strokeColor: strokeColor;
  strokeWidth: strokeWidth;
  opacity: opacity;
  fillStyle: fillStyle;

  // shape definition
  points: Point[] = [];

  constructor(points: Point[]) {
    this.points = points;

    let { backgroundColor, strokeColor, strokeWidth, opacity, fillStyle } =
      useToolStyle.getState();

    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.opacity = opacity;
    this.fillStyle = fillStyle;
  }

  setBackgroundColor(color: backgroundColor) {
    this.backgroundColor = color;
  }

  setStrokeColor(color: strokeColor) {
    this.strokeColor = color;
  }

  setStrokeWidth(width: strokeWidth) {
    this.strokeWidth = width;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }

  setFillStyle(style: fillStyle) {
    this.fillStyle = style;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    {
      ctx.globalAlpha = this.opacity / 100;
      ctx.strokeStyle = this.strokeColor;

      let len = this.points.length - 1;

      if (len > 1) {
        {
          ctx.beginPath();

          ctx.lineWidth = this.strokeWidth * 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(this.points[0].x, this.points[0].y);

          for (let i = 1; i < len; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
          }

          ctx.stroke();
        }

        if (
          this.backgroundColor != "none" &&
          Point.isSamePoint(this.points[0], this.points[len - 1])
        ) {
          ctx.save();
          let [x1, y1, x2, y2] = this.getEnclosingRectangle();

          if (this.fillStyle == "fill") {
            ctx.fillStyle = this.backgroundColor;
            ctx.fill();
          } else if (this.fillStyle == "line") {
            ctx.clip();
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.backgroundColor;

            let d = Math.ceil(
              Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
            );
            ctx.beginPath();

            let gap = this.strokeWidth * 5;
            for (let pos = gap; pos < d * 2; pos += gap) {
              //
              ctx.moveTo(x1 + pos, y1);
              ctx.lineTo(x1, y1 + pos);
            }
            ctx.stroke();
          } else if (this.fillStyle == "crosslines") {
            ctx.clip();
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.backgroundColor;

            let d = Math.ceil(
              Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
            );
            ctx.beginPath();

            let gap = this.strokeWidth * 5;
            for (let pos = gap; pos < d * 2; pos += gap) {
              //
              ctx.moveTo(x1 + pos, y1);
              ctx.lineTo(x1, y1 + pos);
            }
            for (let pos = gap; pos < d * 2; pos += gap) {
              //
              ctx.moveTo(x2, y1 + pos);
              ctx.lineTo(x2 - pos, y1);
            }
            ctx.stroke();
          }

          ctx.restore();
        }
      } else if (len == 1) {
        ctx.beginPath();
        ctx.arc(
          this.points[0].x,
          this.points[0].y,
          this.strokeWidth,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = this.strokeColor;
        ctx.fill();
      }
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
