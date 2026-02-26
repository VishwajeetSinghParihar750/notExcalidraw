import { Circle } from "../Shapes/Circle";
import type ShapeManager from "../ShapeManager";

type state = "idle" | "drawing";
export default class CircleTool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentCircle: Circle | null = null;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentCircle = new Circle(e.clientX, e.clientY, e.clientX, e.clientY);
    this.shapeManager.addShape(this.currentCircle);
  }

  onMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
      this.currentCircle!.endX = e.clientX;
      this.currentCircle!.endY = e.clientY;
    }
  }
  onMouseUp(e: MouseEvent) {
    this.curState = "idle";
    if (
      Math.floor(this.currentCircle!.startX) ==
        Math.floor(this.currentCircle!.endX) ||
      Math.floor(this.currentCircle!.startY) ==
        Math.floor(this.currentCircle!.endY)
    )
      this.shapeManager.removeShape(this.currentCircle!);

    this.currentCircle = null;
  }
}
