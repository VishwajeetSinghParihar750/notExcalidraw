import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";
import { Point } from "../Shapes/Point";

type state = "idle" | "moving";
export default class GrabTool implements Tool {
  toolType: ToolType = "grab";

  shapeManager: ShapeManager;
  curState: state = "idle";

  totalMovementX = 0;
  totalMovementY = 0;

  lastMouseMove = new Point(-1e18, -1e18);
  isScreenEmpty = false;

  emit: (tool: ToolType, event: EventType) => void;
  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }
  reset(): void {
    this.isScreenEmpty = false;
    this.lastMouseMove.x = -1e18;
    this.lastMouseMove.y = -1e18;
    this.totalMovementX = 0;
    this.totalMovementY = 0;
    this.curState = "idle";

    document.body.style.cursor = "default";
  }
  destructor(): void {

    document.body.style.cursor = "default";
  }

  updateScreenEmpty() {
    if (
      this.shapeManager.shapes.some((shape) =>
        shape.liesInside(
          new Point(-this.totalMovementX, -this.totalMovementY),
          new Point(
            -this.totalMovementX + document.body.clientWidth,
            -this.totalMovementY + document.body.clientHeight,
          ),
        ),
      )
    ) {
      this.isScreenEmpty = false;
    } else this.isScreenEmpty = true;
  }

  onCanvasMouseDown(e: MouseEvent) {
    if (this.curState == "idle") {
      this.curState = "moving";

      this.lastMouseMove.x = e.clientX;
      this.lastMouseMove.y = e.clientY;

      this.updateScreenEmpty();
    }
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (this.curState == "moving") {
      document.body.style.cursor = "grabbing";

      let dx = e.clientX - this.lastMouseMove.x;
      let dy = e.clientY - this.lastMouseMove.y;
      this.shapeManager.shapes.forEach((shape) =>
        shape.moveEnclosingRectangle(dx, dy),
      );

      this.lastMouseMove.x = e.clientX;
      this.lastMouseMove.y = e.clientY;

      this.totalMovementX += dx;
      this.totalMovementY += dy;

      this.updateScreenEmpty();
    } else document.body.style.cursor = "grab";
  }
  onCanvasMouseUp(e: MouseEvent) {
    if (this.curState == "moving") {
      this.curState = "idle";
    }
  }

  onOtherMouseDown(e: MouseEvent): void {
    document.body.style.cursor = "default";
  }
  onOtherMouseMove(e: MouseEvent): void {
    document.body.style.cursor = "default";
  }
  onOtherMouseUp(e: MouseEvent): void {
    document.body.style.cursor = "default";
  }

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {}
}
