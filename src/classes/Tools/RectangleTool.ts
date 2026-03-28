import { Rectangle } from "../Shapes/Rectangle";
import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";
import type { Tool as ToolType } from "../../store/Tools.store";
import type { globalMouseEvent } from "../../utils/GlobalMouseEvents";

type state = "idle" | "drawing";

export default class RectangleTool implements Tool {
  toolType: ToolType = "rect";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentRectangle: Rectangle | null = null;
  currentRectangleDeleteSubscriptionId: string | null = null;

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

  handleCurrentRectangleDeleted() {
    if (this.curState == "drawing") {
      this.curState = "idle";
      this.currentRectangle = null;
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.currentRectangleDeleteSubscriptionId!,
      );
      this.currentRectangleDeleteSubscriptionId = null;
    }
  }
  onCanvasMouseDown(e: globalMouseEvent) {
    this.curState = "drawing";
    this.currentRectangle = new Rectangle(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
    );
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "addShape",
      shapeId: this.currentRectangle.shapeId,
      payload: { shape: this.currentRectangle },
    });
    this.currentRectangleDeleteSubscriptionId =
      this.shapeManager.subsribeShapeUpdateEvents(
        this.currentRectangle.shapeId,
        "deleteShape",
        this.handleCurrentRectangleDeleted.bind(this),
      );
  }

  onCanvasMouseMove(e: globalMouseEvent) {
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

      this.handleCurrentRectangleDeleted();
    }
  }

  onOtherMouseDown(): void {}

  onOtherMouseMove(e: globalMouseEvent): void {
    this.onCanvasMouseMove(e);
    document.body.style.cursor = "default";
  }

  onOtherMouseUp(): void {
    this.onCanvasMouseUp();
  }

  onSwitchTool(): void {}
}
