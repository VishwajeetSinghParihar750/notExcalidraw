import type { opacity } from "../../store/Tools.store";
import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import type { Shape } from "../Shapes/Shape";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "erasing";
export default class EraserTool implements Tool {
  toolType: ToolType = "eraser";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentToEraseShapes: Set<Shape> = new Set();

  emit: (tool: ToolType, event: EventType) => void;
  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }

  destructor(): void {}

  onCanvasMouseDown(e: MouseEvent) {
    this.curState = "erasing";
  }

  onCanvasMouseMove(e: MouseEvent) {
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
  onCanvasMouseUp(e: MouseEvent) {
    if (this.curState == "erasing") {
      this.curState = "idle";

      this.shapeManager.updateShapes(
        this.shapeManager.shapes.filter(
          (shape) => !this.currentToEraseShapes.has(shape),
        ),
      );

      this.currentToEraseShapes.clear();

      this.emit(this.toolType, "taskComplete");
    }
  }
  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {}
  onOtherMouseUp(e: MouseEvent): void {}

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {}
}
