import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import { Pen } from "../Shapes/Pen";
import { isSamePoint, type Point } from "../Shapes/Point";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawing";

export default class PenTool implements Tool {
  toolType: ToolType = "pen";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentPen: Pen | null = null;
  currentPenDeleteSubscriptionId: string | null = null;

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
    this.currentPen = null;
    document.body.style.cursor = "default";
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }

  handleCurrentPenDeleted() {
    if (this.curState == "drawing") {
      this.curState = "idle";
      this.currentPen = null;
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.currentPenDeleteSubscriptionId!,
      );
      this.currentPenDeleteSubscriptionId = null;
    }
  }

  onCanvasMouseDown(e: MouseEvent) {
    this.curState = "drawing";
    this.currentPen = new Pen([{ x: e.clientX, y: e.clientY }]);
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "addShape",
      shapeId: this.currentPen.shapeId,
      payload: { shape: this.currentPen },
    });
    this.currentPenDeleteSubscriptionId =
      this.shapeManager.subsribeShapeUpdateEvents(
        this.currentPen.shapeId,
        "deleteShape",
        this.handleCurrentPenDeleted.bind(this),
      );
  }

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";

    if (this.curState == "drawing") {
      let newPoint: Point = { x: e.clientX, y: e.clientY };

      let pts = this.currentPen!.points;
      let firstPoint = pts[0];

      if (isSamePoint(firstPoint, newPoint)) {
        newPoint.x = firstPoint.x;
        newPoint.y = firstPoint.y;

        document.body.style.cursor = "pointer";
      }

      pts.push(newPoint);

      this.shapeManager.handleShapeUpdateEvent({
        _id: crypto.randomUUID(),
        eventType: "updateProperty",
        shapeId: this.currentPen!.shapeId,
        payload: {
          points: pts,
        },
      });
    }
  }

  onCanvasMouseUp() {
    if (this.curState == "drawing") {
      this.curState = "idle";
      this.handleCurrentPenDeleted();
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
