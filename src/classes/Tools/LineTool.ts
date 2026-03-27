import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import { Line } from "../Shapes/Line";
import { isSamePoint, type Point } from "../Shapes/Point";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawingLine" | "drawingPath";

export default class LineTool implements Tool {
  toolType: ToolType = "line";

  shapeManager: ShapeManager;
  curState: state = "idle";

  currentLine: Line | null = null;
  currentLineDeleteSubscriptionId: string | null = null;
  #setCurrentLinePointsHelper(points: Point[]) {
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "updateProperty",
      shapeId: this.currentLine!.shapeId,
      payload: {
        points,
      },
    });
  }
  lastPointInLine: Point = { x: -1e18, y: -1e18 };

  emit: (tool: ToolType, event: EventType) => void;

  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }

  reset(): void {
    this.lastPointInLine.x = -1e18;
    this.lastPointInLine.y = -1e18;
    this.currentLine = null;
    this.curState = "idle";

    document.body.style.cursor = "default";
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }

  handleCurrentLineDeleted() {
    if (this.curState == "drawingLine" || this.curState == "drawingPath") {
      this.curState = "idle";
      this.currentLine = null;
      this.lastPointInLine.x = -1e18;
      this.lastPointInLine.y = -1e18;
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.currentLineDeleteSubscriptionId!,
      );
      this.currentLineDeleteSubscriptionId = null;
    }
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
          this.currentLine = new Line([curPoint, curPoint]);
          this.lastPointInLine = curPoint;

          this.shapeManager.handleShapeUpdateEvent({
            _id: crypto.randomUUID(),
            eventType: "addShape",
            shapeId: this.currentLine.shapeId,
            payload: { shape: this.currentLine },
          });
          this.currentLineDeleteSubscriptionId =
            this.shapeManager.subsribeShapeUpdateEvents(
              this.currentLine.shapeId,
              "deleteShape",
              this.handleCurrentLineDeleted.bind(this),
            );
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

    if (this.curState == "drawingLine" || this.curState == "drawingPath") {
      let pts = this.currentLine!.points;
      pts.pop();
      pts.push(curPoint);
      this.#setCurrentLinePointsHelper(pts);
    }

    let firstPointInLine = this.currentLine?.points[0];
    if (
      this.curState == "drawingPath" &&
      this.currentLine!.points.length > 3 &&
      isSamePoint(curPoint, firstPointInLine!)
    ) {
      document.body.style.cursor = "pointer";
    }
  }

  onCanvasMouseUp(e: MouseEvent) {
    let curPoint: Point = {
      x: Math.floor(e.clientX),
      y: Math.floor(e.clientY),
    };

    switch (this.curState) {
      case "drawingLine":
        {
          let firstPointInLine = this.currentLine?.points[0];

          if (isSamePoint(curPoint, firstPointInLine!)) {
            this.curState = "drawingPath";
          } else {
            let pts = this.currentLine!.points;
            let sp = pts[0];
            let ep = pts[1];

            this.#setCurrentLinePointsHelper([
              sp,
              {
                x: Math.floor((sp.x + ep.x) / 2),
                y: Math.floor((sp.y + ep.y) / 2),
              },
              ep,
            ]);

            this.curState = "idle";
            this.emit(this.toolType, "taskComplete");
            this.handleCurrentLineDeleted();
          }
        }
        break;

      case "drawingPath":
        {
          if (isSamePoint(curPoint, this.lastPointInLine)) {
            let pts = this.currentLine!.points;
            pts.pop();
            this.#setCurrentLinePointsHelper(pts);

            let firstPointInLine = this.currentLine?.points[0];
            let updatedPts = this.currentLine!.points;

            if (
              updatedPts.length > 3 &&
              isSamePoint(this.lastPointInLine, firstPointInLine!)
            ) {
              updatedPts[updatedPts.length - 1] = {
                x: firstPointInLine!.x,
                y: firstPointInLine!.y,
              };
              this.#setCurrentLinePointsHelper(updatedPts);
            }

            this.curState = "idle";
            this.currentLine = null;
            this.lastPointInLine.x = -1e18;
            this.lastPointInLine.y = -1e18;

            this.handleCurrentLineDeleted();

            this.emit(this.toolType, "taskComplete");
          } else {
            let pts = this.currentLine!.points;
            pts.push(curPoint);
            this.#setCurrentLinePointsHelper(pts);
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
