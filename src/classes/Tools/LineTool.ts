import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import { Line } from "../Shapes/Line";
import { Point } from "../Shapes/Point";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawingLine" | "drawingPath";

export default class LineTool implements Tool {
  toolType: ToolType = "line";

  shapeManager: ShapeManager;
  curState: state = "idle";

  currentLine: Line | null = null;
  lastPointInLine: Point = new Point(-1e18, -1e18);

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
    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );

    switch (this.curState) {
      case "idle":
        {
          this.curState = "drawingLine";
          this.currentLine = new Line([curPoint, curPoint]);
          this.lastPointInLine = curPoint;

          this.shapeManager.addShape(this.currentLine);
        }
        break;

      default:
        break;
    }
  }

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";

    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );

    if (this.curState == "drawingLine" || this.curState == "drawingPath") {
      this.currentLine?.points.pop();
      this.currentLine?.points.push(curPoint);
    }

    let firstPointInLine = this.currentLine?.points[0];
    if (
      this.curState == "drawingPath" &&
      this.currentLine!.points.length > 3 &&
      Point.isSamePoint(curPoint, firstPointInLine!)
    ) {
      document.body.style.cursor = "pointer";
    }
  }

  onCanvasMouseUp(e: MouseEvent) {
    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );
    //

    switch (this.curState) {
      case "drawingLine":
        {
          let firstPointInLine = this.currentLine?.points[0];

          if (Point.isSamePoint(curPoint, firstPointInLine!)) {
            this.curState = "drawingPath";
          } else {
            let sp = this.currentLine!.points[0];
            let ep = this.currentLine!.points[1];
            this.currentLine!.points = [
              sp,
              new Point(
                Math.floor((sp.x + ep.x) / 2),
                Math.floor((sp.y + ep.y) / 2),
              ),
              ep,
            ];

            this.curState = "idle";
            this.emit(this.toolType, "taskComplete");
          }
        }
        break;
      case "drawingPath":
        {
          if (Point.isSamePoint(curPoint, this.lastPointInLine)) {
            this.currentLine?.points.pop();

            let firstPointInLine = this.currentLine?.points[0];
            if (
              this.currentLine!.points.length > 3 &&
              Point.isSamePoint(this.lastPointInLine, firstPointInLine!)
            ) {
              //
              this.currentLine!.points[this.currentLine!.points.length - 1] =
                new Point(firstPointInLine!.x, firstPointInLine!.y);
            }

            this.curState = "idle";
            this.currentLine = null;
            this.lastPointInLine.x = -1e18;
            this.lastPointInLine.y = -1e18;

            this.emit(this.toolType, "taskComplete");
          } else {
            this.currentLine?.points.push(curPoint);
            this.lastPointInLine = curPoint;
          }
        }
        break;

      default:
        break;
    }
  }
  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {
    this.onCanvasMouseMove(e);

    document.body.style.cursor = "default";
  }
  onOtherMouseUp(e: MouseEvent): void {
    this.onCanvasMouseUp(e);
  }

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {}
}
