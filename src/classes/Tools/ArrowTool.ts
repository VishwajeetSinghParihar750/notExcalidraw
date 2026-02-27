import type ShapeManager from "../ShapeManager";
import { Point } from "../Shapes/Point";
import { Arrow } from "../Shapes/Arrow";

type state = "idle" | "drawingLine" | "drawingPath";

export default class ArrowTool {
  shapeManager: ShapeManager;
  curState: state = "idle";

  currentLine: Arrow | null = null;
  lastPointInLine: Point = new Point(-1e18, -1e18);

  constructor(shapeManager: ShapeManager) {
    this.shapeManager = shapeManager;
  }

  onMouseDown(e: MouseEvent) {
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

  onMouseMove(e: MouseEvent) {
    let curPoint: Point = new Point(
      Math.floor(e.clientX),
      Math.floor(e.clientY),
    );

    if (this.curState == "drawingLine" || this.curState == "drawingPath") {
      this.currentLine?.points.pop();
      this.currentLine?.points.push(curPoint);
    }
  }

  onMouseUp(e: MouseEvent) {
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
}
