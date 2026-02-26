import type { Shape } from "./Shape";

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

export type Point = { x: number; y: number };

export class Line implements Shape {
  // style properties
  backgroundColor: backgroundColor;
  strokeColor: strokeColor;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  edgeRadius: edgeRadius;
  opacity: opacity;
  fillStyle: fillStyle;

  // shape definition

  points: Point[];

  constructor(points: Point[]) {
    this.points = points;

    let {
      backgroundColor,
      strokeColor,
      strokeWidth,
      strokeStyle,
      edgeRadius,
      opacity,
      fillStyle,
    } = useToolStyle.getState();

    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle;
    this.edgeRadius = edgeRadius;
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

  setStrokeStyle(style: strokeStyle) {
    this.strokeStyle = style;
  }

  setEdgeRadius(radius: edgeRadius) {
    this.edgeRadius = radius;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }

  setFillStyle(style: fillStyle) {
    this.fillStyle = style;
  }

  update(points: Point[]) {
    this.points = points;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.save();

    //
    {
      ctx.globalAlpha = this.opacity / 100;

      if (this.strokeStyle == "smalldotted") ctx.setLineDash([4, 8]);
      else if (this.strokeStyle == "dotted") ctx.setLineDash([8, 16]);

      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      let len = this.points.length;

      for (let i = 1; i < len; i++) {
        ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    return [1, 2, 3, 5];
  }
  containsPoint(x: number, y: number) {
    return true;
  }
}
