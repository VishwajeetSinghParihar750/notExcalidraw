import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";

import {
  useSelectedShapes,
  useToolStyle,
  type Tool as ToolType,
} from "../../store/Tools.store";
import { useCursorToolActions } from "../../store/UiActions.store";
import { isSamePoint, type Point } from "../Shapes/Point";
import type { Shape } from "../Shapes/Shape";
import { Selection } from "../Shapes/Selection";
import { Text } from "../Shapes/Text";
import { getStrokeColorString } from "../../utils/Theme";

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
  | "movingControlPoint"
  | "editingText";

type selectionMovementInfo = {
  lastPoint: Point;
  reset: () => void;
};
type textEditingInitializeInfo = {
  lastMouseup: Point;
  lastTime: Date;
  lastWasEmtpyArea: boolean;
  reset: () => void;
};
export default class CursorTool implements Tool {
  toolType: ToolType = "arrow";

  shapeManager: ShapeManager;
  curState: state = "idle";

  selectionStart: Point = { x: -1e18, y: -1e18 };
  selectionEnd: Point = { x: -1e18, y: -1e18 };

  selectedShapes: Shape[] = [];
  updateSelectedShapes(shapes: Shape[]) {
    this.selectedShapes.length = 0;
    this.selectedShapes.push(...shapes);
  }

  curSelection: Selection;

  curPoint: Point = { x: -1e18, y: -1e18 };

  curtextEditingInitiliazeInfo: textEditingInitializeInfo = {
    lastMouseup: { x: -1e18, y: -1e18 },
    lastTime: new Date(),
    lastWasEmtpyArea: false,
    reset() {
      this.lastWasEmtpyArea = false;
      this.lastMouseup.x = -1e18;
      this.lastMouseup.y = -1e18;
    },
  };

  curSelectionMovementInfo: selectionMovementInfo = {
    lastPoint: { x: 0, y: 0 },
    reset: () => {
      this.curSelectionMovementInfo.lastPoint.x = 0;
      this.curSelectionMovementInfo.lastPoint.y = 0;
    },
  };

  // for text editing
  curText: Text | null = null;
  editableTextContainer: React.RefObject<HTMLDivElement | null>;
  currentInputElement: HTMLTextAreaElement;

  updateCurrentTextEnclosingRectangle() {
    let rect = this.currentInputElement.getBoundingClientRect();
    this.curText!.setEnclosingRectangleCoordinates(
      rect.x,
      rect.y,
      rect.x + rect.width,
      rect.y + rect.height,
    );
  }

  reset(): void {
    if (this.curText)
      this.editableTextContainer.current?.removeChild?.(
        this.currentInputElement,
      );
    this.curText = null;

    this.curState = "idle";
    this.curPoint.x = -1e18;
    this.curPoint.y = -1e18;
    this.selectionStart.x = -1e18;
    this.selectionStart.y = -1e18;
    this.selectionEnd.x = -1e18;
    this.selectionEnd.y = -1e18;
    this.updateSelectedShapes([]);
    this.curState = "idle";
    document.body.style.cursor = "default";
  }
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

    // for text editign

    let sub11 = useToolStyle.subscribe(
      (state) => state.fontFamily,
      (state) => {
        if (this.curText) {
          this.curText.setFontFamily(state);
          switch (this.curText.fontFamily) {
            case "code":
              this.currentInputElement.style.fontFamily = "Code";
              break;
            case "normal":
              this.currentInputElement.style.fontFamily = "sans-serif";
              break;
            case "hand":
              this.currentInputElement.style.fontFamily = "Handwriting";
              break;

            default:
              break;
          }

          requestAnimationFrame(() => {
            this.currentInputElement.style.height = "auto";
            this.currentInputElement.style.height =
              this.currentInputElement.scrollHeight + "px";

            this.currentInputElement.style.width = "auto";
            this.currentInputElement.style.width =
              this.currentInputElement.scrollWidth + "px";
          });
        }
      },
    );

    let sub12 = useToolStyle.subscribe(
      (state) => state.fontSize,
      (state) => {
        if (this.curText) {
          this.curText.setFontSize(state);

          switch (this.curText.fontSize) {
            case "small":
              this.currentInputElement.style.fontSize = "16px";
              this.currentInputElement.style.lineHeight = "20px";
              break;
            case "medium":
              this.currentInputElement.style.fontSize = "24px";
              this.currentInputElement.style.lineHeight = "30px";
              break;
            case "large":
              this.currentInputElement.style.fontSize = "32px";
              this.currentInputElement.style.lineHeight = "38px";
              break;
            case "extra-large":
              this.currentInputElement.style.fontSize = "40px";
              this.currentInputElement.style.lineHeight = "48px";
              break;

            default:
              break;
          }

          requestAnimationFrame(() => {
            this.currentInputElement.style.height = "auto";
            this.currentInputElement.style.height =
              this.currentInputElement.scrollHeight + "px";

            this.currentInputElement.style.width = "auto";
            this.currentInputElement.style.width =
              this.currentInputElement.scrollWidth + "px";
          });
        }
      },
    );
    let sub13 = useToolStyle.subscribe(
      (state) => state.opacity,
      (state) => {
        if (this.curText) {
          this.currentInputElement.style.opacity = (state / 100).toString();
          this.curText.setOpacity(state);
        }
      },
    );
    let sub14 = useToolStyle.subscribe(
      (state) => state.strokeColor,
      (state) => {
        if (this.curText) {
          this.currentInputElement.style.color = getStrokeColorString(state);
          this.curText.setStrokeColor(state);
        }
      },
    );

    // for selection actions

    let sub15 = useCursorToolActions.subscribe(
      (state) => state.duplicateCurrentSelection,
      () => {
        this.handleDuplicateAction();
      },
    );
    let sub16 = useCursorToolActions.subscribe(
      (state) => state.deleteCurrentSelection,
      () => {
        this.handleDeleteAction();
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
      sub11,
      sub12,
      sub13,
      sub14,
      sub15,
      sub16,
    );
  }

  constructor(
    shapeManager: ShapeManager,
    editableTextContainer: React.RefObject<HTMLDivElement | null>,
    eventCallback: (tool: ToolType, event: EventType) => void,
  ) {
    this.curSelection = new Selection(
      [this.selectionStart, this.selectionEnd],
      this.selectedShapes,
      shapeManager,
    );

    this.zustandSubscribe();
    this.shapeManager = shapeManager;
    this.emit = eventCallback;
    this.editableTextContainer = editableTextContainer;

    this.currentInputElement = document.createElement("textarea");
    this.currentInputElement.onmousedown = (e) => e.stopPropagation();
    this.currentInputElement.onmouseup = (e) => e.stopPropagation();
    this.currentInputElement.onmousemove = (e) => {
      e.stopPropagation();
    };

    this.currentInputElement.id = "textool input element";

    this.currentInputElement.style.height = "0px";
    this.currentInputElement.style.width = "0px";
    this.currentInputElement.style.boxSizing = "content-box";
    this.currentInputElement.rows = 1;
    this.currentInputElement.cols = 1;

    this.currentInputElement.style.whiteSpace = "pre";

    this.currentInputElement.style.resize = "none";
    this.currentInputElement.style.overflow = "hidden";
    this.currentInputElement.style.outline = "none";

    this.currentInputElement.addEventListener("input", () => {
      this.currentInputElement.style.height = "auto";
      this.currentInputElement.style.height =
        this.currentInputElement.scrollHeight + "px";
      this.currentInputElement.style.width = "auto";
      this.currentInputElement.style.width =
        this.currentInputElement.scrollWidth + "px";
    });
  }
  destructor(): void {
    this.zustandSubscriptions.forEach((unsub) => unsub());
    if (this.curText)
      this.editableTextContainer.current?.removeChild?.(
        this.currentInputElement,
      );
    document.body.style.cursor = "default";
  }

  handleDeleteAction() {
    if (this.curState == "selected") {
      this.selectedShapes.forEach((shape) =>
        this.shapeManager.removeShape(shape.shapeId),
      );
      this.updateSelectedShapes([]);
      useSelectedShapes.setState({ selectedShapes: new Set() });

      this.shapeManager.removeShape(this.curSelection.shapeId);
      this.curState = "idle";
    }
  }
  handleDuplicateAction() {
    if (this.curState == "selected") {
      let newSelection = this.curSelection.clone();
      this.curSelection.moveEnclosingRectangle(10, 10);

      newSelection.selectedShapes.forEach((shape) =>
        this.shapeManager.addShape(shape),
      );
    }
  }

  onSwitchTool(oldTool: ToolType): void {
    {
      if (oldTool == "cursor") {
        this.updateSelectedShapes([]);
        useSelectedShapes.setState({
          selectedShapes: new Set(),
        });

        if (this.curState == "selecting" || this.curState == "selected") {
          this.shapeManager.removeShape(this.curSelection.shapeId);
        } else if (this.curState == "editingText") {
          this.updateCurrentTextEnclosingRectangle();

          this.curText?.setText(this.currentInputElement.value);
          this.curText?.setCurState("render");
          this.currentInputElement.value = "";
          if (this.curText!.text.length == 0)
            this.shapeManager.removeShape(this.curText!.shapeId);
          this.editableTextContainer.current?.removeChild(
            this.currentInputElement,
          );
          this.curText = null;
          this.curText = null;
        }

        this.curState = "idle";
      }
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

          if (!isSamePoint(this.curPoint, this.selectionStart)) {
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
      case "editingText":
        {
          this.curState = "idle";
          useSelectedShapes.setState({ selectedShapes: new Set() });

          this.updateCurrentTextEnclosingRectangle();

          this.curText?.setText(this.currentInputElement.value);
          this.curText?.setCurState("render");
          this.currentInputElement.value = "";
          if (this.curText!.text.length == 0)
            this.shapeManager.removeShape(this.curText!.shapeId);
          this.editableTextContainer.current?.removeChild(
            this.currentInputElement,
          );
          this.curText = null;
        }
        break;
      case "selecting":
        {
          if (this.selectedShapes.length > 0) {
            this.curState = "selected";
            this.curSelection.setDrawSelectionArea(false);
          } else {
            //ch3ecking double click
            if (
              this.curtextEditingInitiliazeInfo.lastWasEmtpyArea &&
              new Date().getMilliseconds() -
                this.curtextEditingInitiliazeInfo.lastTime.getMilliseconds() <
                300 &&
              isSamePoint(
                this.curPoint,
                this.curtextEditingInitiliazeInfo.lastMouseup,
              )
            ) {
              //
              this.curState = "editingText";
              useSelectedShapes.setState({ selectedShapes: new Set(["text"]) });

              //
              const containerRect =
                this.editableTextContainer.current!.getBoundingClientRect();

              let curPoint: Point = {
                x: Math.floor(e.clientX - containerRect.left),
                y: Math.floor(e.clientY - containerRect.top),
              };
              this.curText = new Text(
                "edit",
                "",
                [
                  { x: curPoint.x, y: curPoint.y },
                  { x: curPoint.x, y: curPoint.y },
                ],
                this.shapeManager,
              );
              this.shapeManager.addShape(this.curText);

              this.currentInputElement.value = this.curText.text;

              this.currentInputElement.style.position = "absolute";
              this.currentInputElement.style.top = `${this.curText.getEnclosingRectangle()[1]}px`;
              this.currentInputElement.style.left = `${this.curText.getEnclosingRectangle()[0]}px`;

              this.currentInputElement.style.color = getStrokeColorString(
                this.curText.strokeColor,
              );
              this.currentInputElement.style.opacity = (
                this.curText.opacity / 100
              ).toString();

              let fontsizevalue = this.curText.fontSize;

              switch (this.curText.fontSize) {
                case "small":
                  fontsizevalue = 16;
                  break;
                case "medium":
                  fontsizevalue = 24;
                  break;
                case "large":
                  fontsizevalue = 32;
                  break;
                case "extra-large":
                  fontsizevalue = 40;
                  break;

                default:
                  fontsizevalue = this.curText.fontSize;
                  useToolStyle.setState({ fontSize: fontsizevalue });
                  break;
              }

              this.currentInputElement.style.lineHeight =
                fontsizevalue * 1.2 + "px";
              this.currentInputElement.style.fontSize = fontsizevalue + "px";

              switch (this.curText.fontFamily) {
                case "code":
                  this.currentInputElement.style.fontFamily = "Code";
                  break;
                case "normal":
                  this.currentInputElement.style.fontFamily = "sans-serif";
                  break;
                case "hand":
                  this.currentInputElement.style.fontFamily = "Handwriting";
                  break;

                default:
                  break;
              }

              this.editableTextContainer.current?.appendChild(
                this.currentInputElement,
              );

              this.currentInputElement.style.height = "auto";
              this.currentInputElement.style.height =
                this.currentInputElement.scrollHeight + "px";
              this.currentInputElement.style.width = "auto";
              this.currentInputElement.style.width =
                this.currentInputElement.scrollWidth + "px";

              this.curText.setCurState("edit");

              this.currentInputElement.select();
              this.curtextEditingInitiliazeInfo.reset();
            } else {
              this.curState = "idle";
              this.curtextEditingInitiliazeInfo.lastMouseup.x = this.curPoint.x;
              this.curtextEditingInitiliazeInfo.lastMouseup.y = this.curPoint.y;
              this.curtextEditingInitiliazeInfo.lastTime = new Date();
              this.curtextEditingInitiliazeInfo.lastWasEmtpyArea = true;
            }

            this.shapeManager.removeShape(this.curSelection.shapeId);
          }
        }
        break;

      case "movingSelection":
        {
          if (
            this.selectedShapes.length == 1 &&
            this.selectedShapes[0].shapeType == "text"
          ) {
            //ch3ecking double click
            if (
              this.curtextEditingInitiliazeInfo.lastWasEmtpyArea &&
              new Date().getMilliseconds() -
                this.curtextEditingInitiliazeInfo.lastTime.getMilliseconds() <
                300 &&
              isSamePoint(
                this.curPoint,
                this.curtextEditingInitiliazeInfo.lastMouseup,
              )
            ) {
              //
              this.curState = "editingText";

              this.curText = this.selectedShapes[0] as Text;

              this.updateSelectedShapes([]);
              useSelectedShapes.setState({ selectedShapes: new Set(["text"]) });

              this.currentInputElement.value = this.curText.text;

              this.currentInputElement.style.position = "absolute";
              this.currentInputElement.style.top = `${this.curText.getEnclosingRectangle()[1]}px`;
              this.currentInputElement.style.left = `${this.curText.getEnclosingRectangle()[0]}px`;

              this.currentInputElement.style.color = getStrokeColorString(
                this.curText.strokeColor,
              );
              this.currentInputElement.style.opacity = (
                this.curText.opacity / 100
              ).toString();

              let fontsizevalue = this.curText.fontSize;

              switch (this.curText.fontSize) {
                case "small":
                  fontsizevalue = 16;
                  break;
                case "medium":
                  fontsizevalue = 24;
                  break;
                case "large":
                  fontsizevalue = 32;
                  break;
                case "extra-large":
                  fontsizevalue = 40;
                  break;

                default:
                  fontsizevalue = this.curText.fontSize;
                  useToolStyle.setState({ fontSize: fontsizevalue });
                  break;
              }

              this.currentInputElement.style.lineHeight =
                fontsizevalue * 1.2 + "px";
              this.currentInputElement.style.fontSize = fontsizevalue + "px";

              switch (this.curText.fontFamily) {
                case "code":
                  this.currentInputElement.style.fontFamily = "Code";
                  break;
                case "normal":
                  this.currentInputElement.style.fontFamily = "sans-serif";
                  break;
                case "hand":
                  this.currentInputElement.style.fontFamily = "Handwriting";
                  break;

                default:
                  break;
              }

              this.editableTextContainer.current?.appendChild(
                this.currentInputElement,
              );

              this.currentInputElement.style.height = "auto";
              this.currentInputElement.style.height =
                this.currentInputElement.scrollHeight + "px";
              this.currentInputElement.style.width = "auto";
              this.currentInputElement.style.width =
                this.currentInputElement.scrollWidth + "px";

              this.curText.setCurState("edit");

              this.currentInputElement.select();
              this.curtextEditingInitiliazeInfo.reset();

              this.shapeManager.removeShape(this.curSelection.shapeId);
            } else {
              this.curState = "selected";
              this.curSelectionMovementInfo.reset();

              this.curtextEditingInitiliazeInfo.lastMouseup.x = this.curPoint.x;
              this.curtextEditingInitiliazeInfo.lastMouseup.y = this.curPoint.y;
              this.curtextEditingInitiliazeInfo.lastTime = new Date();
              this.curtextEditingInitiliazeInfo.lastWasEmtpyArea = true;
            }
          } else {
            this.curState = "selected";
            this.curSelectionMovementInfo.reset();
            this.curtextEditingInitiliazeInfo.reset();
          }
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

  onOtherMouseDown(): void {}
  onOtherMouseMove(e: MouseEvent): void {
    if (this.curState != "editingText") this.onCanvasMouseMove(e);
  }
  onOtherMouseUp(e: MouseEvent): void {
    if (this.curState != "editingText") this.onCanvasMouseUp(e);
  }
}
