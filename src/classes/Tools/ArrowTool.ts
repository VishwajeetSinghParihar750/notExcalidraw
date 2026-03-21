import type ShapeManager from "../Managers/ShapeManager";
import { isSamePoint } from "../Shapes/Point";
import type { Point } from "../Shapes/Point";
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
  lastPointInLine: Point = { x: -1e18, y: -1e18 };

  emit: (tool: ToolType, event: EventType) => void;

  reset(): void {
    this.curState = "idle";
    this.currentLine = null;
    this.lastPointInLine.x = -1e18;
    this.lastPointInLine.y = -1e18;
    document.body.style.cursor = "default";
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }

  constructor(
    shapeManager: ShapeManager,
    eventCallback: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = eventCallback;
  }

  onCanvasMouseDown(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

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

  onCanvasMouseMove(e: MouseEvent) {
    document.body.style.cursor = "crosshair";

    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

    let { arrowType } = useToolStyle.getState();

    if (this.curState == "drawingLine") {
      let pts = this.currentLine!.points;

      if (arrowType == "snake") {
        let startPoint = pts[0];
        let endPoint = curPoint;

        let dx = Math.abs(endPoint.x - startPoint.x);
        let dy = Math.abs(endPoint.y - startPoint.y);

        if (dx > dy) {
          let mx = Math.floor((startPoint.x + endPoint.x) / 2);
          this.currentLine!.setPoints([
            startPoint,
            { x: mx, y: startPoint.y },
            { x: mx, y: endPoint.y },
            endPoint,
          ]);
        } else {
          let my = Math.floor((startPoint.y + endPoint.y) / 2);
          this.currentLine!.setPoints([
            startPoint,
            { x: startPoint.x, y: my },
            { x: endPoint.x, y: my },
            endPoint,
          ]);
        }
      } else if (arrowType == "straight" || arrowType == "curve") {
        pts.pop();
        pts.push(curPoint);
        this.currentLine!.setPoints(pts);
      }
    } else if (this.curState == "drawingPath") {
      let pts = this.currentLine!.points;
      pts.pop();
      pts.push(curPoint);
      this.currentLine!.setPoints(pts);
    }
  }

  onCanvasMouseUp(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

    let { arrowType } = useToolStyle.getState();

    switch (this.curState) {
      case "drawingLine":
        {
          let pts = this.currentLine!.points;
          let firstPointInLine = pts[0];

          if (isSamePoint(curPoint, firstPointInLine)) {
            if (arrowType == "straight" || arrowType == "curve")
              this.curState = "drawingPath";
            else if (arrowType == "snake") {
              this.curState = "idle";
              this.shapeManager.removeShape(this.currentLine!.shapeId);
              this.currentLine = null;
              this.lastPointInLine.x = -1e18;
              this.lastPointInLine.y = -1e18;
            }
          } else {
            let startPoint = pts[0];
            let endPoint = pts[pts.length - 1];

            if (arrowType == "straight" || arrowType == "curve") {
              this.currentLine!.setPoints([
                startPoint,
                {
                  x: Math.floor((startPoint.x + endPoint.x) / 2),
                  y: Math.floor((startPoint.y + endPoint.y) / 2),
                },
                endPoint,
              ]);
            } else if (arrowType == "snake") {
              let dx = Math.abs(endPoint.x - startPoint.x);
              let dy = Math.abs(endPoint.y - startPoint.y);

              if (dx > dy) {
                let mx = Math.floor((startPoint.x + endPoint.x) / 2);
                this.currentLine!.setPoints([
                  startPoint,
                  { x: mx, y: startPoint.y },
                  { x: mx, y: endPoint.y },
                  endPoint,
                ]);
              } else {
                let my = Math.floor((startPoint.y + endPoint.y) / 2);
                this.currentLine!.setPoints([
                  startPoint,
                  { x: startPoint.x, y: my },
                  { x: endPoint.x, y: my },
                  endPoint,
                ]);
              }
            }

            this.curState = "idle";
            this.emit(this.toolType, "taskComplete");
          }
        }
        break;

      case "drawingPath":
        {
          let pts = this.currentLine!.points;

          if (isSamePoint(curPoint, this.lastPointInLine)) {
            pts.pop();
            this.currentLine!.setPoints(pts);

            let firstPointInLine = this.currentLine!.points[0];
            let updatedPts = this.currentLine!.points;

            if (
              updatedPts.length > 3 &&
              isSamePoint(this.lastPointInLine, firstPointInLine)
            ) {
              updatedPts[updatedPts.length - 1] = {
                x: firstPointInLine.x,
                y: firstPointInLine.y,
              };
              this.currentLine!.setPoints(updatedPts);
            }

            this.curState = "idle";
            this.emit(this.toolType, "taskComplete");

            this.currentLine = null;
            this.lastPointInLine.x = -1e18;
            this.lastPointInLine.y = -1e18;
          } else {
            pts.push(curPoint);
            this.currentLine!.setPoints(pts);
            this.lastPointInLine = curPoint;
          }
        }
        break;

      default:
        break;
    }
  }

  onOtherMouseDown(): void {}

  onOtherMouseMove(e: MouseEvent): void {
    this.onCanvasMouseMove(e);
    document.body.style.cursor = "default";
  }

  onOtherMouseUp(e: MouseEvent): void {
    this.onCanvasMouseUp(e);
  }

  onSwitchTool(): void {}
}
