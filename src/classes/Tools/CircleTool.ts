import { Circle } from "../Shapes/Circle";
import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";
import type { EventType } from "../Managers/ToolManager";

type state = "idle" | "drawing";

export default class CircleTool implements Tool {
  toolType: ToolType = "circle";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentCircle: Circle | null = null;

  emit: (tool: ToolType, event: EventType) => void;

  reset(): void {
    this.curState = "idle";
    this.currentCircle = null;

    document.body.style.cursor = "default";
  }

  onSwitchTool(): void {}

  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }

  onCanvasMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentCircle = new Circle(e.clientX, e.clientY, e.clientX, e.clientY);
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "addShape",
      shapeId: this.currentCircle.shapeId,
      payload: { shape: this.currentCircle },
    });
  }
  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";
    if (this.curState == "drawing") {
      this.shapeManager.handleShapeUpdateEvent({
        _id: crypto.randomUUID(),
        eventType: "updateEnclosingRectangle",
        shapeId: this.currentCircle!.shapeId,
        payload: {
          toUpdate: "updateFull",
          x1: this.currentCircle!.startX,
          y1: this.currentCircle!.startY,
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
        Math.floor(this.currentCircle!.startX) ==
          Math.floor(this.currentCircle!.endX) ||
        Math.floor(this.currentCircle!.startY) ==
          Math.floor(this.currentCircle!.endY)
      )
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "deleteShape",
          shapeId: this.currentCircle!.shapeId,
        });
      else this.emit(this.toolType, "taskComplete");

      this.currentCircle = null;
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
}
