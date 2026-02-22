import type { Shape } from "./Shape";

type strokeStyle = "line" | "dotted" | "large-dotted";
type edgeRadius = 0 | 10;

export class Rectangle implements Shape {
  static backgroundColor: string = "null";
  static strokeColor: string = "black";
  static strokeWdith: number = 2;
  static strokeStyle: strokeStyle = "line";
  static edgeRadius: edgeRadius = 10;
  static opacity: number = 100;

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
    ctx.strokeStyle = Rectangle.strokeColor;
    ctx.fillStyle = Rectangle.backgroundColor;
    ctx.lineWidth = Rectangle.strokeWdith;
  }
}
