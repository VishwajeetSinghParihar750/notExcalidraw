import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";

import {
  useSelectedShapes,
  useToolStyle,
  type Tool as ToolType,
} from "../../store/Tools.store";
import { Point } from "../Shapes/Point";
import type { Shape } from "../Shapes/Shape";
import { Selection } from "../Shapes/Selection";

type state =
  | "idle"
  | "selecting"
  | "selected"
  | "movingSelection"
  | "movingRightBoundary"
  | "movingLeftBoundary"
  | "movingTopBoundary"
  | "movingBottomBoundary"
  | "movingTopLeftCorner"
  | "movingTopRightCorner"
  | "movingBottomLeftCorner"
  | "movingBottomRightCorner"
  | "movingControlPoint";

type selectionMovementInfo = {
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
  updateSelectedShapes(shapes: Shape[]) {
    this.selectedShapes.length = 0;
    this.selectedShapes.push(...shapes);
  }

  curSelection: Selection = new Selection(
    [this.selectionStart, this.selectionEnd],
    this.selectedShapes,
  );

  curPoint: Point = new Point(-1e18, -1e18);

  curSelectionMovementInfo: selectionMovementInfo = {
    lastPoint: new Point(0, 0),
    reset: () => {
      this.curSelectionMovementInfo.lastPoint.x = 0;
      this.curSelectionMovementInfo.lastPoint.y = 0;
    },
  };

  emit: (tool: ToolType, event: EventType) => void;

  zustandSubscriptions: any[] = [];
  zustandSubscribe() {
    let sub1 = useToolStyle.subscribe(
      (state) => state.arrowType,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setArrowType?.(newval);
        });
      },
    );
    let sub2 = useToolStyle.subscribe(
      (state) => state.edgeRadius,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setEdgeRadius?.(newval);
        });
      },
    );
    let sub10 = useToolStyle.subscribe(
      (state) => state.fontSize,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setFontSize?.(newval);
        });
      },
    );
    let sub9 = useToolStyle.subscribe(
      (state) => state.fontFamily,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setFontFamily?.(newval);
        });
      },
    );
    let sub8 = useToolStyle.subscribe(
      (state) => state.fillStyle,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setFillStyle?.(newval);
        });
      },
    );
    let sub7 = useToolStyle.subscribe(
      (state) => state.backgroundColor,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setBackgroundColor?.(newval);
        });
      },
    );
    let sub6 = useToolStyle.subscribe(
      (state) => state.opacity,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setOpacity?.(newval);
        });
      },
    );
    let sub5 = useToolStyle.subscribe(
      (state) => state.strokeStyle,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setStrokeStyle?.(newval);
        });
      },
    );
    let sub4 = useToolStyle.subscribe(
      (state) => state.strokeWidth,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setStrokeWidth?.(newval);
        });
      },
    );
    let sub3 = useToolStyle.subscribe(
      (state) => state.strokeColor,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          shape.setStrokeColor?.(newval);
        });
      },
    );
    this.zustandSubscriptions.push(
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
      sub6,
      sub7,
      sub8,
      sub9,
      sub10,
    );
  }
  constructor(
    shapeManager: ShapeManager,
    eventCallback: (tool: ToolType, event: EventType) => void,
  ) {
    this.zustandSubscribe();
    this.shapeManager = shapeManager;
    this.emit = eventCallback;
  }
  destructor(): void {
    this.zustandSubscriptions.forEach((unsub) => unsub());
  }

  onSwitchTool(oldTool: ToolType, newTool: ToolType): void {
    {
      if (this.curState == "selecting" || this.curState == "selected") {
        this.curState = "idle";
        this.shapeManager.removeShape(this.curSelection);
      }

      useSelectedShapes.setState({
        selectedShapes: new Set(
          this.selectedShapes.map((shape) => shape.shapeType),
        ),
      });
    }
  }

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
          if (
            this.curSelection.isControlPoint(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "pointer";
          } else if (
            this.curSelection.isTopLeftCorner(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "nwse-resize";
          } else if (
            this.curSelection.isTopRightCorner(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "nesw-resize";
          } else if (
            this.curSelection.isBottomLeftCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "nesw-resize";
          } else if (
            this.curSelection.isBottomRightCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "nwse-resize";
          } else if (
            this.curSelection.isBottomBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ns-resize";
          } else if (
            this.curSelection.isLeftBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ew-resize";
          } else if (
            this.curSelection.isRightBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ew-resize";
          } else if (
            this.curSelection.isTopBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ns-resize";
          } else if (
            this.curSelection.containsPoint(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "move";
          } else {
            document.body.style.cursor = "default";
          }
        }
        break;
      case "selecting":
        {
          this.selectionEnd.x = this.curPoint.x;
          this.selectionEnd.y = this.curPoint.y;

          if (!Point.isSamePoint(this.curPoint, this.selectionStart)) {
            this.updateSelectedShapes(
              this.shapeManager
                .getShapesInside(this.selectionStart, this.selectionEnd)
                .filter((shape) => shape.shapeType != "selection"),
            );
            useSelectedShapes.setState({
              selectedShapes: new Set(
                this.selectedShapes.map((shape) => shape.shapeType),
              ),
            });
          }
        }
        break;
      case "movingSelection":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveEnclosingRectangle(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopBoundary":
        {
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveTopBoundary(dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomBoundary":
        {
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveBottomBoundary(dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingRightBoundary":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          this.curSelection.moveRightBoundary(delx);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingLeftBoundary":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          this.curSelection.moveLeftBoundary(delx);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopLeftCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveTopLeftCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomRightCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveBottomRightCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopRightCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveTopRightCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomLeftCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelection.moveBottomLeftCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
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

            this.updateSelectedShapes([
              shapesAtCurPoint[shapesAtCurPoint.length - 1],
            ]);
            useSelectedShapes.setState({
              selectedShapes: new Set(
                this.selectedShapes.map((shape) => shape.shapeType),
              ),
            });

            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };

            this.curSelection.setDrawSelectionArea(false);
          } else {
            this.curState = "selecting";

            this.selectionStart.x = this.curPoint.x;
            this.selectionStart.y = this.curPoint.y;
            this.selectionEnd.x = this.curPoint.x;
            this.selectionEnd.y = this.curPoint.y;

            useSelectedShapes.setState({ selectedShapes: new Set() });

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
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isTopLeftCorner(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingTopLeftCorner";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isTopRightCorner(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingTopRightCorner";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isBottomLeftCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            this.curState = "movingBottomLeftCorner";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isBottomRightCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            this.curState = "movingBottomRightCorner";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isBottomBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingBottomBoundary";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isLeftBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingLeftBoundary";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isRightBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingRightBoundary";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.isTopBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingTopBoundary";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else if (
            this.curSelection.containsPoint(this.curPoint.x, this.curPoint.y)
          ) {
            this.curState = "movingSelection";
            this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
          } else {
            this.curState = "selecting";

            this.selectionStart.x = this.curPoint.x;
            this.selectionStart.y = this.curPoint.y;
            this.selectionEnd.x = this.curPoint.x;
            this.selectionEnd.y = this.curPoint.y;

            this.updateSelectedShapes([]);
            useSelectedShapes.setState({ selectedShapes: new Set() });
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

          useSelectedShapes.setState({
            selectedShapes: new Set(
              this.selectedShapes.map((shape) => shape.shapeType),
            ),
          });
        }
        break;

      case "movingSelection":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingBottomBoundary":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingTopBoundary":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingLeftBoundary":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingRightBoundary":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingTopLeftCorner":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingTopRightCorner":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingBottomRightCorner":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      case "movingBottomLeftCorner":
        {
          this.curState = "selected";
          this.curSelectionMovementInfo.reset();
        }
        break;
      default:
        break;
    }
  }

  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {
    this.onCanvasMouseMove(e);
  }
  onOtherMouseUp(e: MouseEvent): void {
    this.onCanvasMouseUp(e);
  }
}
