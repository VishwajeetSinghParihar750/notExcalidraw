import { Rectangle } from "../Shapes/Rectangle";
import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";

type state = "idle" | "drawing";
export default class RectangleTool implements Tool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentRectangle: Rectangle | null = null;

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }
  destructor(): void {
    
  }

  onMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentRectangle = new Rectangle(
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
