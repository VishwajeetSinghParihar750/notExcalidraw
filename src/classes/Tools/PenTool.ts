import type ShapeManager from "../ShapeManager";
import { Pen } from "../Shapes/Pen";
import { Point } from "../Shapes/Point";

type state = "idle" | "drawing";
export default class PenTool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentPen: Pen | null = null;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentPen = new Pen([new Point(e.clientX, e.clientY)]);
    this.shapeManager.addShape(this.currentPen);
  }

  onMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
      let newPoint = new Point(e.clientX, e.clientY);

      let firstPoint = this.currentPen!.points[0];

      if (Point.isSamePoint(firstPoint, newPoint)) {
        newPoint.x = firstPoint.x;
        newPoint.y = firstPoint.y;
      }

      this.currentPen?.points.push(newPoint);
    }
  }
  onMouseUp(e: MouseEvent) {
    this.curState = "idle";
    this.currentPen = null;
  }
}
