import { RotatedRecangle } from "../Shapes/RotatedRectangle";
import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawing";
export default class RotatedRectangleTool implements Tool {
  toolType: ToolType = "rotrect";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentRectangle: RotatedRecangle | null = null;
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
    this.curState = "drawing";
    this.currentRectangle = new RotatedRecangle(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
    );
    this.shapeManager.addShape(this.currentRectangle);
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
      this.currentRectangle!.endX = e.clientX;
      this.currentRectangle!.endY = e.clientY;
    }
  }
  onCanvasMouseUp(e: MouseEvent) {
    if (this.curState == "drawing") {
      this.curState = "idle";
      if (
        Math.floor(this.currentRectangle!.startX) ==
          Math.floor(this.currentRectangle!.endX) ||
        Math.floor(this.currentRectangle!.startY) ==
          Math.floor(this.currentRectangle!.endY)
      )
        this.shapeManager.removeShape(this.currentRectangle!);
      else this.emit(this.toolType, "taskComplete");

      this.currentRectangle = null;
    }
  }

  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {
    this.onCanvasMouseMove(e);
  }
  onOtherMouseUp(e: MouseEvent): void {
    this.onCanvasMouseUp(e);
  }

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {}
}
