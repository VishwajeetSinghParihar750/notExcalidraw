import type ShapeManager from "../ShapeManager";
import { Line } from "../Shapes/Line";
import type { Point } from "../Shapes/Line";

type state = "idle" | "drawingLine" | "drawingPath";

export default class LineTool {
  shapeManager: ShapeManager;
  curState: state = "idle";

  currentLine: Line | null = null;
  lastMouseDown: Point = { x: -1, y: -1 };
  lastMouseDownTime: Date = new Date();

  lastClick: Point = { x: -1, y: -1 };
  lastClickTime: Date = new Date();

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

    switch (this.curState) {
      case "idle":
        {
          this.curState = "drawingLine";
          this.currentLine = new Line([curPoint, curPoint]);

          this.shapeManager.addShape(this.currentLine);
        }
        break;
      case "drawingPath":
        {
          if (!this.currentLine)
            throw new Error("currentline is null in mousedown drawingPath ");

          this.currentLine!.points.push(curPoint);
        }
        break;

      default:
        break;
    }

    this.lastMouseDown = curPoint;
    this.lastMouseDownTime = new Date(Date.now());
  }

  onMouseMove(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

    if (this.curState == "drawingLine" || this.curState == "drawingPath") {
      this.currentLine?.points.pop();
      this.currentLine?.points.push(curPoint);
    }
  }

  onMouseUp(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };
    //

    switch (this.curState) {
      case "drawingLine":
        {
          if (
            curPoint.x == this.lastMouseDown.x &&
            curPoint.y == this.lastMouseDown.y
          ) {
            this.curState = "drawingPath";
          } else {
            this.curState = "idle";
            console.log(this.shapeManager.shapes);
          }
        }
        break;
      case "drawingPath":
        {
          let lastPointInLine =
            this.currentLine?.points[this.currentLine.points.length - 1];

          if (
            // means double click
            curPoint.x == this.lastMouseDown.x &&
            curPoint.y == this.lastMouseDown.y &&
            lastPointInLine?.x == curPoint.x &&
            lastPointInLine.y == curPoint.y
          ) {
            this.curState = "idle";
            this.currentLine = null;
          }
        }
        break;

      default:
        break;
    }
  }
}
