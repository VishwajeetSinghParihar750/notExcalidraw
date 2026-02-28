import type { Shape, ShapeType } from "./Shape";

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

export class RotatedRecangle implements Shape {
  shapeType: ShapeType = "rotrect";
  // style properties
  backgroundColor: backgroundColor;
  strokeColor: strokeColor;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  edgeRadius: edgeRadius;
  opacity: opacity;
  fillStyle: fillStyle;

  // shape definition
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

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

  update(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let [x1, y1, x2, y2] = this.getEnclosingRectangle();

    ctx.save();

    ctx.globalAlpha = this.opacity / 100;

    {
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      ctx.lineWidth = this.strokeWidth;
      ctx.strokeStyle = this.strokeColor;

      {
        let [x1, y1, x2, y2, x3, y3, x4, y4] = this.getShape();

        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

        if (x2 - x1 > this.edgeRadius && y2 - y1 > this.edgeRadius) {
          let ux = dx / len;
          let uy = dy / len;

          let beginx;
          let beginy;
          if (Math.abs(dx) > Math.abs(dy)) {
            beginx = x1 + ux * this.edgeRadius;
            beginy = y1 + uy * this.edgeRadius;
          } else {
            beginx = x2 - ux * this.edgeRadius;
            beginy = y2 - uy * this.edgeRadius;
          }

          ctx.moveTo(beginx, beginy);

          ctx.arcTo(x2, y2, x3, y3, this.edgeRadius);
          ctx.arcTo(x3, y3, x4, y4, this.edgeRadius);
          ctx.arcTo(x4, y4, x1, y1, this.edgeRadius);
          ctx.arcTo(x1, y1, x2, y2, this.edgeRadius);
          ctx.lineTo(beginx, beginy);
        }
      }

      if (this.strokeStyle == "smalldotted") {
        ctx.setLineDash([4, 8]);
      } else if (this.strokeStyle == "dotted") ctx.setLineDash([8, 16]);

      ctx.stroke();

      ctx.restore();
    }

    if (this.backgroundColor != "none") {
      ctx.save();

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

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = Math.min(this.startX, this.endX);
    let x2 = Math.max(this.startX, this.endX);
    let y1 = Math.min(this.startY, this.endY);
    let y2 = Math.max(this.startY, this.endY);
    return [x1, y1, x2, y2];
  }
  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    return x >= sx && x <= ex && y >= sy && y <= ey;
  }
}
