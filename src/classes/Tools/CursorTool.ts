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
  | "scaling"
  | "scalingX"
  | "scalingY"
  | "movingControlPoint";

export default class CursorTool implements Tool {
  toolType: ToolType = "arrow";

  shapeManager: ShapeManager;
  curState: state = "idle";

  selectionStart: Point = new Point(-1e18, -1e18);
  selectionEnd: Point = new Point(-1e18, -1e18);

  curSelection: Selection = new Selection(
    [this.selectionStart, this.selectionEnd],
    [],
  );
  selectedShapes: Shape[] = [];

  curPoint: Point = new Point(-1e18, -1e18);

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
      case "selecting":
        {
          this.selectionEnd.x = this.curPoint.x;
          this.selectionEnd.y = this.curPoint.y;

          if (!Point.isSamePoint(this.curPoint, this.selectionStart)) {
            this.selectedShapes = this.shapeManager
              .getShapesInside(this.selectionStart, this.selectionEnd)
              .filter((shape) => shape.shapeType != "selection");
            this.curSelection.setSelectedShapes(this.selectedShapes);
          }
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
          this.curState = "selecting";

          this.selectionStart.x = this.curPoint.x;
          this.selectionStart.y = this.curPoint.y;
          this.selectionEnd.x = this.curPoint.x;
          this.selectionEnd.y = this.curPoint.y;

          this.curSelection.setDrawSelectionArea(true);
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
          } else {
            this.curState = "selecting";

            this.selectionStart.x = this.curPoint.x;
            this.selectionStart.y = this.curPoint.y;
            this.selectionEnd.x = this.curPoint.x;
            this.selectionEnd.y = this.curPoint.y;

            this.curSelection.setSelectedShapes([]);
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
          if (Point.isSamePoint(this.selectionEnd, this.selectionStart)) {
            //
            let shapes = this.shapeManager
              .getShapesAt(this.selectionStart.x, this.selectionStart.y)
              .filter((shape) => shape.shapeType != "selection");

            if (shapes.length > 0)
              this.selectedShapes = [shapes[shapes.length - 1]];
            else this.selectedShapes = [];
          } else {
            let shapes = this.shapeManager
              .getShapesInside(this.selectionStart, this.selectionEnd)
              .filter((shape) => shape.shapeType != "selection");

            if (shapes.length > 0)
              this.selectedShapes = [shapes[shapes.length - 1]];
            else this.selectedShapes = [];
          }

          if (this.selectedShapes.length > 0) {
            this.curState = "selected";
            this.curSelection.setDrawSelectionArea(false);
          } else {
            this.curState = "idle";
            this.shapeManager.removeShape(this.curSelection);
          }

          console.log(this.curState);
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
