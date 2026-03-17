import { Rectangle } from "../Shapes/Rectangle";
import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawing";

export default class RectangleTool implements Tool {
  toolType: ToolType = "rect";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentRectangle: Rectangle | null = null;

  emit: (tool: ToolType, event: EventType) => void;

  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }

  reset(): void {
    this.curState = "idle";
    this.currentRectangle = null;
    document.body.style.cursor = "default";
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }

  onCanvasMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentRectangle = new Rectangle(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
      this.shapeManager,
    );
    this.shapeManager.addShape(this.currentRectangle);
  }

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";
    if (this.curState == "drawing") {
      this.currentRectangle!.setEndX(e.clientX);
      this.currentRectangle!.setEndY(e.clientY);
    }
  }

  onCanvasMouseUp() {
    if (this.curState == "drawing") {
      this.curState = "idle";

      if (
        Math.floor(this.currentRectangle!.startX) ==
          Math.floor(this.currentRectangle!.endX) ||
        Math.floor(this.currentRectangle!.startY) ==
          Math.floor(this.currentRectangle!.endY)
      )
        this.shapeManager.removeShape(this.currentRectangle!.shapeId);
      else this.emit(this.toolType, "taskComplete");

      this.currentRectangle = null;
    }
  }

  onOtherMouseDown(): void {}

  onOtherMouseMove(e: MouseEvent): void {
    this.onCanvasMouseMove(e);
    document.body.style.cursor = "default";
  }

  onOtherMouseUp(): void {
    this.onCanvasMouseUp();
  }

  onSwitchTool(): void {}
}
