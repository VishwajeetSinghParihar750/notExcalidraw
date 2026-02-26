import { Circle } from "../Circle";
import type ShapeManager from "../ShapeManager";

type state = "idle" | "drawing";
export default class CircleTool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentRectangle: Circle | null = null;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentRectangle = new Circle(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
    );
    this.shapeManager.addShape(this.currentRectangle);
  }

  onMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
      this.currentRectangle!.endX = e.clientX;
      this.currentRectangle!.endY = e.clientY;
    }
  }
  onMouseUp(e: MouseEvent) {
    this.curState = "idle";
    if (
      Math.floor(this.currentRectangle!.startX) ==
        Math.floor(this.currentRectangle!.endX) ||
      Math.floor(this.currentRectangle!.startY) ==
        Math.floor(this.currentRectangle!.endY)
    )
      this.shapeManager.removeShape(this.currentRectangle!);

    this.currentRectangle = null;
  }
}
