import type ShapeManager from "../Managers/ShapeManager";
import { Point } from "../Shapes/Point";
import { Arrow } from "../Shapes/Arrow";
import { useToolStyle } from "../../store/Tools.store";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";

import type { Tool as ToolType } from "../../store/Tools.store";
type state = "idle" | "drawingLine" | "drawingPath";

export default class ArrowTool implements Tool {
  toolType: ToolType = "arrow";

  shapeManager: ShapeManager;
  curState: state = "idle";

  currentLine: Arrow | null = null;
  lastPointInLine: Point = new Point(-1e18, -1e18);

  emit: (tool: ToolType, event: EventType) => void;

  reset(): void {}
  constructor(
    shapeManager: ShapeManager,
    eventCallback: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = eventCallback;
  }

  onCanvasMouseDown(e: MouseEvent) {
    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );

    switch (this.curState) {
      case "idle":
        {
          this.curState = "drawingLine";
          this.currentLine = new Arrow([curPoint, curPoint]);
          this.lastPointInLine = curPoint;

          this.shapeManager.addShape(this.currentLine);
        }
        break;

      default:
        break;
    }
  }
  destructor(): void {}

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";

    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );

    let { arrowType } = useToolStyle.getState();

    if (this.curState == "drawingLine") {
      if (arrowType == "snake") {
        //          //
        let startPoint = this.currentLine!.points[0];
        let endPoint = curPoint;

        let dx = Math.abs(endPoint.x - startPoint.x);
        let dy = Math.abs(endPoint.y - startPoint.y);

        if (dx > dy) {
          let mx = Math.floor((startPoint.x + endPoint.x) / 2);
          this.currentLine!.points = [
            startPoint,
            new Point(mx, startPoint.y),
            new Point(mx, endPoint.y),
            endPoint,
          ];
        } else {
          let my = Math.floor((startPoint.y + endPoint.y) / 2);
          this.currentLine!.points = [
            startPoint,
            new Point(startPoint.x, my),
            new Point(endPoint.x, my),
            endPoint,
          ];
        }
      } else if (arrowType == "straight" || arrowType == "curve") {
        this.currentLine?.points.pop();
        this.currentLine?.points.push(curPoint);
      }
    } else if (this.curState == "drawingPath") {
      this.currentLine?.points.pop();
      this.currentLine?.points.push(curPoint);
    }
  }

  onCanvasMouseUp(e: MouseEvent) {
    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );
    //
    let { arrowType } = useToolStyle.getState();

    switch (this.curState) {
      case "drawingLine":
        {
          let firstPointInLine = this.currentLine?.points[0];

          if (Point.isSamePoint(curPoint, firstPointInLine!)) {
            if (arrowType == "straight" || arrowType == "curve")
              this.curState = "drawingPath";
            else if (arrowType == "snake") {
              //
              this.curState = "idle";
              this.shapeManager.removeShape(this.currentLine!);
              this.currentLine = null;
              this.lastPointInLine.x = -1e18;
              this.lastPointInLine.y = -1e18;
            }
          } else {
            let startPoint = this.currentLine!.points[0];
            let endPoint =
              this.currentLine!.points[this.currentLine!.points.length - 1];

            if (arrowType == "straight" || arrowType == "curve") {
              this.currentLine!.points = [
                startPoint,
                new Point(
                  Math.floor((startPoint.x + endPoint.x) / 2),
                  Math.floor((startPoint.y + endPoint.y) / 2),
                ),
                endPoint,
              ];
            } else if (arrowType == "snake") {
              //          //
              let dx = Math.abs(endPoint.x - startPoint.x);
              let dy = Math.abs(endPoint.y - startPoint.y);

              if (dx > dy) {
                let mx = Math.floor((startPoint.x + endPoint.x) / 2);
                this.currentLine!.points = [
                  startPoint,
                  new Point(mx, startPoint.y),
                  new Point(mx, endPoint.y),
                  endPoint,
                ];
              } else {
                let my = Math.floor((startPoint.y + endPoint.y) / 2);
                this.currentLine!.points = [
                  startPoint,
                  new Point(startPoint.x, my),
                  new Point(endPoint.x, my),
                  endPoint,
                ];
              }
            }

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
            this.emit(this.toolType, "taskComplete");

            this.currentLine = null;
            this.lastPointInLine.x = -1e18;
            this.lastPointInLine.y = -1e18;
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
