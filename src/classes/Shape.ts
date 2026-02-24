export interface Shape {
  draw: (ctx: CanvasRenderingContext2D) => void;
  containsPoint: (x: number, y: number) => boolean;
}
