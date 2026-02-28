import type { Shape } from "./Shapes/Shape";

export default class ShapeManager {
  shapes: Shape[] = [];

  addShape(shape: Shape) {
    this.shapes.push(shape);
  }

  removeShape(shape: Shape) {
    this.shapes = this.shapes.filter((v) => v != shape);
  }

  updateShapes(shapes: Shape[]) {
    this.shapes = shapes;
  }

  getShapesAt(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => shape.containsPoint(x, y));
  }
}
