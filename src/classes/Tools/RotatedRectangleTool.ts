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
    this.currentRectangle = new RotatedRecangle(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
    );
    // this.shapeManager.addShape(this.currentRectangle);
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "addShape",
      payload: { shape: this.currentRectangle },
    });
  }

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";
    if (this.curState == "drawing") {
      this.shapeManager.handleShapeUpdateEvent({
        _id: crypto.randomUUID(),
        eventType: "updateEnclosingRectangle",
        shapeId: this.currentRectangle!.shapeId,
        payload: {
          toUpdate: "updateFull",
          x1: this.currentRectangle!.startX,
          y1: this.currentRectangle!.startY,
          x2: e.clientX,
          y2: e.clientY,
        },
      });
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
        // this.shapeManager.removeShape(this.currentRectangle!.shapeId);
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "deleteShape",
          shapeId: this.currentRectangle!.shapeId,
        });
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
