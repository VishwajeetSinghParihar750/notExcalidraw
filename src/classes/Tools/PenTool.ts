import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import { Pen } from "../Shapes/Pen";
import { Point } from "../Shapes/Point";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawing";
export default class PenTool implements Tool {
  toolType: ToolType = "pen";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentPen: Pen | null = null;

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
    this.currentPen = new Pen([new Point(e.clientX, e.clientY)]);
    this.shapeManager.addShape(this.currentPen);
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
      let newPoint = new Point(e.clientX, e.clientY);

      let firstPoint = this.currentPen!.points[0];

      if (Point.isSamePoint(firstPoint, newPoint)) {
        newPoint.x = firstPoint.x;
        newPoint.y = firstPoint.y;
      }

      this.currentPen?.points.push(newPoint);
    }
  }
  onCanvasMouseUp(e: MouseEvent) {
    if (this.curState == "drawing") {
      this.curState = "idle";
      this.currentPen = null;

      this.emit(this.toolType, "taskComplete");
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
