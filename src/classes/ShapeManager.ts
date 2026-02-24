import type { Shape } from "./Shape";

export default class ShapeManager {
  shapes: Shape[] = [];

  addShape(shape: Shape) {
    this.shapes.push(shape);
  }

  removeShape(shape: Shape) {
    this.shapes = this.shapes.filter((v) => v != shape);
  }

  getShapesAt(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => shape.containsPoint(x, y));
  }
}
