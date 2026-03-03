import type ShapeManager from "../Managers/ShapeManager";
import { Pen } from "../Shapes/Pen";
import { Point } from "../Shapes/Point";
import type Tool from "./Tool";

type state = "idle" | "drawing";
export default class PenTool implements Tool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentPen: Pen | null = null;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }
  destructor(): void {}
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
