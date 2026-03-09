import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";

import type { Tool as ToolType } from "../../store/Tools.store";
import { Point } from "../Shapes/Point";
import type { Shape } from "../Shapes/Shape";
import { Selection } from "../Shapes/Selection";

type state =
  | "idle"
  | "selecting"
  | "selected"
  | "movingSelection"
  // | "scaling"
  // | "scalingX"
  // | "scalingY"
  | "movingControlPoint";

type movingSelectionInfo = {
  lastPoint: Point;
  reset: () => void;
};

export default class CursorTool implements Tool {
  toolType: ToolType = "arrow";

  shapeManager: ShapeManager;
  curState: state = "idle";

  selectionStart: Point = new Point(-1e18, -1e18);
  selectionEnd: Point = new Point(-1e18, -1e18);

  selectedShapes: Shape[] = [];
  curSelection: Selection = new Selection(
    [this.selectionStart, this.selectionEnd],
    this.selectedShapes,
  );

  curPoint: Point = new Point(-1e18, -1e18);

  curMovingSelectionInfo: movingSelectionInfo = {
    lastPoint: new Point(0, 0),
    reset: () => {
      this.curMovingSelectionInfo.lastPoint.x = 0;
      this.curMovingSelectionInfo.lastPoint.y = 0;
    },
  };

  emit: (tool: ToolType, event: EventType) => void;

  constructor(
    shapeManager: ShapeManager,
    eventCallback: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = eventCallback;
  }
  destructor(): void {}

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {}

  onCanvasMouseMove(e: MouseEvent) {
    this.curPoint.x = Math.floor(e.x);
    this.curPoint.y = Math.floor(e.y);

    switch (this.curState) {
      case "idle":
        {
          //
          let shapesAtCurPoint = this.shapeManager.getShapesAt(
            this.curPoint.x,
            this.curPoint.y,
          );
          if (shapesAtCurPoint.length > 0) {
            document.body.style.cursor = "move";
          } else document.body.style.cursor = "default";
        }
        break;
      case "selected":
        {
          //
          let shapesAtCurPoint = this.shapeManager.getShapesAt(
            this.curPoint.x,
            this.curPoint.y,
          );
          if (shapesAtCurPoint.length > 0) {
            document.body.style.cursor = "move";
          } else document.body.style.cursor = "default";
        }
        break;
      case "selecting":
        {
          this.selectionEnd.x = this.curPoint.x;
          this.selectionEnd.y = this.curPoint.y;

          if (!Point.isSamePoint(this.curPoint, this.selectionStart)) {
            this.selectedShapes.length = 0;

            this.selectedShapes.push(
              ...this.shapeManager
                .getShapesInside(this.selectionStart, this.selectionEnd)
                .filter((shape) => shape.shapeType != "selection"),
            );
          }
        }
        break;
      case "movingSelection":
        {
          let delx = this.curPoint.x - this.curMovingSelectionInfo.lastPoint.x;
          let dely = this.curPoint.y - this.curMovingSelectionInfo.lastPoint.y;
          this.curSelection.moveEnclosingRectangle(delx, dely);

          this.curMovingSelectionInfo.lastPoint = { ...this.curPoint };
        }
        break;

      default:
        break;
    }
  }
  onCanvasMouseDown(e: MouseEvent) {
    this.curPoint.x = Math.floor(e.x);
    this.curPoint.y = Math.floor(e.y);

    switch (this.curState) {
      case "idle":
        {
          //
          let shapesAtCurPoint = this.shapeManager.getShapesAt(
            this.curPoint.x,
            this.curPoint.y,
          );
          if (shapesAtCurPoint.length > 0) {
            this.curState = "movingSelection";
            this.selectedShapes.length = 1;
            this.selectedShapes[0] =
              shapesAtCurPoint[shapesAtCurPoint.length - 1];

            this.curMovingSelectionInfo.lastPoint = { ...this.curPoint };

            this.curSelection.setDrawSelectionArea(false);
          } else {
            this.curState = "selecting";

            this.selectionStart.x = this.curPoint.x;
            this.selectionStart.y = this.curPoint.y;
            this.selectionEnd.x = this.curPoint.x;
            this.selectionEnd.y = this.curPoint.y;

            this.curSelection.setDrawSelectionArea(true);
          }

          this.shapeManager.addShape(this.curSelection);
        }
        break;
      case "selected":
        {
          if (
            this.curSelection.isControlPoint(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingControlPoint";
          } else if (
            this.curSelection.containsPoint(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingSelection";
            this.curMovingSelectionInfo.lastPoint = { ...this.curPoint };
          } else {
            this.curState = "selecting";

            this.selectionStart.x = this.curPoint.x;
            this.selectionStart.y = this.curPoint.y;
            this.selectionEnd.x = this.curPoint.x;
            this.selectionEnd.y = this.curPoint.y;

            this.selectedShapes.length = 0;
            this.curSelection.setDrawSelectionArea(true);
          }
        }
        break;
      default:
        break;
    }
  }
  onCanvasMouseUp(e: MouseEvent) {
    this.curPoint.x = Math.floor(e.x);
    this.curPoint.y = Math.floor(e.y);

    switch (this.curState) {
      case "selecting":
        {
          if (this.selectedShapes.length > 0) {
            this.curState = "selected";
            this.curSelection.setDrawSelectionArea(false);
          } else {
            this.curState = "idle";
            this.shapeManager.removeShape(this.curSelection);
          }
        }
        break;
      case "movingSelection":
        {
          this.curState = "selected";
          this.curMovingSelectionInfo.reset();
        }
        break;
      default:
        break;
    }
  }

  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {}
  onOtherMouseUp(e: MouseEvent): void {}
}
