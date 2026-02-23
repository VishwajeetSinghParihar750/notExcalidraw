import type { Shape } from "./Shape";

import type {
  backgroundColor,
  edgeRadius,
  opacity,
  strokeColor,
  strokeStyle,
  strokeWidth,
} from "../store/Tools.store";

export class Rectangle implements Shape {
  // style properties
  backgroundColor: backgroundColor = "null";
  strokeColor: strokeColor = "black";
  strokeWdith: strokeWidth = 2;
  strokeStyle: strokeStyle = "line";
  edgeRadius: edgeRadius = 10;
  opacity: opacity = 100;

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
  }

  update(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.rect(
      this.startX,
      this.startY,
      this.endX - this.startX,
      this.endY - this.startY,
    );
  }
}
