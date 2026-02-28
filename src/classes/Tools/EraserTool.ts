import type { opacity } from "../../store/Tools.store";
import type ShapeManager from "../ShapeManager";
import type { Shape } from "../Shapes/Shape";

type state = "idle" | "erasing";
export default class EraserTool {
  shapeManager: ShapeManager;
  curState: state = "idle";
  currentToEraseShapes: Set<Shape> = new Set();

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
    this.curState = "erasing";
  }

  onMouseMove(e: MouseEvent) {
    if (this.curState == "erasing") {
      let shapes = this.shapeManager.getShapesAt(e.clientX, e.clientY);
      for (let shape of shapes) {
        if (!this.currentToEraseShapes.has(shape)) {
          this.currentToEraseShapes.add(shape);
          shape.setOpacity(Math.max(0, shape.opacity - 50) as opacity);
        }
      }
    }
  }
  onMouseUp(e: MouseEvent) {
    this.curState = "idle";

    this.shapeManager.updateShapes(
      this.shapeManager.shapes.filter(
        (shape) => !this.currentToEraseShapes.has(shape),
      ),
    );

    this.currentToEraseShapes.clear();
  }
}
