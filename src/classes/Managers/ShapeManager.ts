import type { Point } from "../Shapes/Point";
import type { Shape, shapeId } from "../Shapes/Shape";
import type { shapeUpdateEvent } from "../../types/shapeUpdateEvents";

export default class ShapeManager {
  shapes: Shape[] = [];

  addShape(shape: Shape) {
    this.shapes.push(shape);
  }
  removeShape(id: shapeId) {
    this.shapes = this.shapes.filter((v) => v.shapeId != id);
  }

  handleShapeUpdateEvent(op: shapeUpdateEvent) {
    switch (op.eventType) {
      case "updateEnclosingRectangle":
        {
        }
        break;

      case "updateProperty":
        {
        }
        break;

      default:
        break;
    }
  }

  getShapesAt(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => shape.containsPoint(x, y));
  }
  getShapesInside(point1: Point, point2: Point) {
    return this.shapes.filter((shape) => shape.liesInside(point1, point2));
  }
}
