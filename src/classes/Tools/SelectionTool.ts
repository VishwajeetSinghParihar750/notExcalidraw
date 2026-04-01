import type ShapeManager from "../Managers/ShapeManager";
import type Tool from "./Tool";
import type { EventType } from "../Managers/ToolManager";

import {
  useGrabToolPosition,
  useSelectedShapes,
  useToolStyle,
  type Tool as ToolType,
} from "../../store/Tools.store";
import { useCursorToolActions } from "../../store/UiActions.store";
import { isSamePoint, type Point } from "../Shapes/Point";
import type { Shape, shapeId } from "../Shapes/Shape";
import { Selection } from "../Shapes/Selection";
import { Text } from "../Shapes/Text";
import { getStrokeColorString } from "../../utils/Theme";
import type { globalMouseEvent } from "../../utils/GlobalMouseEvents";

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

export default class SelectionTool implements Tool {
  toolType: ToolType = "arrow";

  shapeManager: ShapeManager;
  curState: state = "idle";

  selectionStart: Point = { x: -1e18, y: -1e18 };
  selectionEnd: Point = { x: -1e18, y: -1e18 };

  selectedShapes: Shape[] = [];
  selectedShapeDeleteSubscriptions: Map<string, string> = new Map();
  updateSelectionArea(point1: Point, point2: Point) {
    this.selectionStart = point1;
    this.selectionEnd = point2;
    this.#setShapePropertyHelper(this.curSelection.shapeId, {
      selectionArea: [{ ...point1 }, { ...point2 }],
    });
  }
  updateSelectedShapes(shapes: Shape[]) {
    this.selectedShapes.forEach((shape) => {
      const subscriptionId = this.selectedShapeDeleteSubscriptions.get(
        shape.shapeId,
      );
      if (subscriptionId) {
        this.shapeManager.unsubsribeShapeUpdateEvents(subscriptionId);
        this.selectedShapeDeleteSubscriptions.delete(shape.shapeId);
      }
    });

    this.selectedShapes.length = 0;
    this.selectedShapes.push(...shapes);

    shapes.forEach((shape) => {
      const subscriptionId = this.shapeManager.subsribeShapeUpdateEvents(
        shape.shapeId,
        "deleteShape",
        () => this.handleSelectedShapeDeleted(shape.shapeId),
      );
      this.selectedShapeDeleteSubscriptions.set(shape.shapeId, subscriptionId);
    });

    this.#setShapePropertyHelper(this.curSelection.shapeId, {
      selectedShapes: this.selectedShapes,
    });
  }

  handleSelectedShapeDeleted(shapeId: shapeId) {
    const index = this.selectedShapes.findIndex(
      (shape) => shape.shapeId === shapeId,
    );
    if (index !== -1) {
      this.selectedShapes.splice(index, 1);
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.selectedShapeDeleteSubscriptions.get(shapeId)!,
      );
      this.selectedShapeDeleteSubscriptions.delete(shapeId);

      this.#setShapePropertyHelper(this.curSelection.shapeId, {
        selectedShapes: this.selectedShapes,
      });
    }
  }

  curSelectionPositionUpdaters = {
    moveEnclosingRectangle: (delX: number, delY: number) => {
      this.selectedShapes.forEach((shape) => {
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "updateEnclosingRectangle",
          shapeId: shape.shapeId,
          payload: { toUpdate: "moveFull", delX, delY },
        });
      });
    },
    updateEnclosingRectangle: (
      nsx: number,
      nsy: number,
      nex: number,
      ney: number,
    ) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      if (
        Math.min(ney - nsy, nex - nsx) < this.curSelection!.shapeResizeThreshold
      )
        return;

      this!.selectedShapes.forEach((shape) => {
        let [x1, y1, x2, y2] = shape.getEnclosingRectangle();

        x1 = nsx + ((x1 - sx) * (nex - nsx)) / (ex - sx);
        y1 = nsy + ((y1 - sy) * (ney - nsy)) / (ey - sy);

        x2 = nsx + ((x2 - sx) * (nex - nsx)) / (ex - sx);
        y2 = nsy + ((y2 - sy) * (ney - nsy)) / (ey - sy);

        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "updateEnclosingRectangle",
          shapeId: shape.shapeId,
          payload: { toUpdate: "updateFull", x1, y1, x2, y2 },
        });
      });
    },

    scaleTopLeftCorner: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delY: number,
    ) => {
      let nsy = sy + delY;
      let nex = ex;
      let ney = ey;

      let nsx = nex - ((ex - sx) * (ney - nsy)) / (ey - sy);

      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },
    scaleTopLeftCornerX: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delX: number,
    ) => {
      let nsx = sx + delX;
      let nex = ex;
      let ney = ey;

      let nsy = ney - ((nex - nsx) * (ey - sy)) / (ex - sx);

      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },
    scaleTopRightCorner: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delY: number,
    ) => {
      let nsy = sy + delY;
      let nsx = sx;
      let ney = ey;

      let nex = nsx + ((ex - sx) * (ney - nsy)) / (ey - sy);
      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },
    scaleBottomRightCorner: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delY: number,
    ) => {
      let nsx = sx;
      let nsy = sy;
      let ney = ey + delY;
      let nex = nsx + ((ex - sx) * (ney - nsy)) / (ey - sy);

      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },
    scaleBottomRightCornerX: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delX: number,
    ) => {
      let nsx = sx;
      let nsy = sy;

      let nex = ex + delX;
      let ney = nsy + ((nex - nsx) * (ey - sy)) / (ex - sx);

      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },
    scaleBottomLeftCorner: (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      delY: number,
    ) => {
      let nex = ex;
      let nsy = sy;

      let ney = ey + delY;
      let nsx = nex - ((ex - sx) * (ney - nsy)) / (ey - sy);

      this.curSelectionPositionUpdaters.updateEnclosingRectangle(
        nsx,
        nsy,
        nex,
        ney,
      );
    },

    moveTopLeftCorner: (delX: number, delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx + delX;
      let nsy = sy + delY;
      let nex = ex;
      let ney = ey;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleTopLeftCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveTopRightCorner: (delX: number, delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx;
      let nsy = sy + delY;
      let nex = ex + delX;
      let ney = ey;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleTopRightCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveBottomLeftCorner: (delX: number, delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx + delX;
      let nsy = sy;
      let nex = ex;
      let ney = ey + delY;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleBottomLeftCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveBottomRightCorner: (delX: number, delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx;
      let nsy = sy;
      let nex = ex + delX;
      let ney = ey + delY;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleBottomRightCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },

    moveTopBoundary: (delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx;
      let nsy = sy + delY;
      let nex = ex;
      let ney = ey;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleTopLeftCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveLeftBoundary: (delX: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx + delX;
      let nsy = sy;
      let nex = ex;
      let ney = ey;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleTopLeftCornerX(
          sx,
          sy,
          ex,
          ey,
          delX,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveRightBoundary: (delX: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx;
      let nsy = sy;
      let nex = ex + delX;
      let ney = ey;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleBottomRightCornerX(
          sx,
          sy,
          ex,
          ey,
          delX,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
    moveBottomBoundary: (delY: number) => {
      let [sx, sy, ex, ey] = this.curSelection!.getEnclosingRectangle();

      let nsx = sx;
      let nsy = sy;
      let nex = ex;
      let ney = ey + delY;

      if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
        this.curSelectionPositionUpdaters.scaleBottomRightCorner(
          sx,
          sy,
          ex,
          ey,
          delY,
        );
      else
        this.curSelectionPositionUpdaters.updateEnclosingRectangle(
          nsx,
          nsy,
          nex,
          ney,
        );
    },
  };

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
  currentTextDeleteSubscriptionId: string | null = null;
  editableTextContainer: React.RefObject<HTMLDivElement | null>;
  currentInputElement: HTMLTextAreaElement;

  #setShapePropertyHelper(shapeId: shapeId, payload: any) {
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "updateProperty",
      shapeId: shapeId,
      payload,
    });
  }

  updateCurrentTextEnclosingRectangle() {
    let rect = this.currentInputElement.getBoundingClientRect();
    const [x, y] = this.curText!.getEnclosingRectangle();
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "updateEnclosingRectangle",
      shapeId: this.curText!.shapeId,
      payload: {
        toUpdate: "updateFull",
        x1: x,
        y1: y,
        x2: x + rect.width,
        y2: y + rect.height,
      },
    });
  }

  handleCurrentTextDeleted() {
    if (this.curState == "editingText") {
      this.curState = "idle";
      this.curText = null;
      this.currentInputElement.value = "";
      this.editableTextContainer.current?.removeChild?.(
        this.currentInputElement,
      );
      this.currentTextDeleteSubscriptionId = null;
    }
  }

  reset(): void {
    if (this.curText)
      this.editableTextContainer.current?.removeChild?.(
        this.currentInputElement,
      );
    this.curText = null;

    if (this.currentTextDeleteSubscriptionId) {
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.currentTextDeleteSubscriptionId,
      );
      this.currentTextDeleteSubscriptionId = null;
    }

    this.selectedShapeDeleteSubscriptions.forEach((subscriptionId) => {
      this.shapeManager.unsubsribeShapeUpdateEvents(subscriptionId);
    });
    this.selectedShapeDeleteSubscriptions.clear();

    this.curState = "idle";
    this.curPoint.x = -1e18;
    this.curPoint.y = -1e18;

    this.updateSelectionArea({ ...this.curPoint }, { ...this.curPoint });
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
          if ((shape as any).setArrowType)
            this.#setShapePropertyHelper(shape.shapeId, { arrowType: newval });
        });
      },
    );
    let sub2 = useToolStyle.subscribe(
      (state) => state.edgeRadius,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setEdgeRadius)
            this.#setShapePropertyHelper(shape.shapeId, { edgeRadius: newval });
        });
      },
    );
    let sub10 = useToolStyle.subscribe(
      (state) => state.fontSize,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setFontSize)
            this.#setShapePropertyHelper(shape.shapeId, { fontSize: newval });
        });
      },
    );
    let sub9 = useToolStyle.subscribe(
      (state) => state.fontFamily,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setFontFamily)
            this.#setShapePropertyHelper(shape.shapeId, { fontFamily: newval });
        });
      },
    );
    let sub8 = useToolStyle.subscribe(
      (state) => state.fillStyle,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setFillStyle)
            this.#setShapePropertyHelper(shape.shapeId, { fillStyle: newval });
        });
      },
    );
    let sub7 = useToolStyle.subscribe(
      (state) => state.backgroundColor,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setBackgroundColor)
            this.#setShapePropertyHelper(shape.shapeId, {
              backgroundColor: newval,
            });
        });
      },
    );
    let sub6 = useToolStyle.subscribe(
      (state) => state.opacity,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setOpacity)
            this.#setShapePropertyHelper(shape.shapeId, { opacity: newval });
        });
      },
    );
    let sub5 = useToolStyle.subscribe(
      (state) => state.strokeStyle,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setStrokeStyle)
            this.#setShapePropertyHelper(shape.shapeId, {
              strokeStyle: newval,
            });
        });
      },
    );
    let sub4 = useToolStyle.subscribe(
      (state) => state.strokeWidth,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setStrokeWidth)
            this.#setShapePropertyHelper(shape.shapeId, {
              strokeWidth: newval,
            });
        });
      },
    );
    let sub3 = useToolStyle.subscribe(
      (state) => state.strokeColor,
      (newval) => {
        this.selectedShapes.forEach((shape) => {
          if ((shape as any).setStrokeColor)
            this.#setShapePropertyHelper(shape.shapeId, {
              strokeColor: newval,
            });
        });
      },
    );

    // for text editign

    let sub11 = useToolStyle.subscribe(
      (state) => state.fontFamily,
      (state) => {
        if (this.curText) {
          this.#setShapePropertyHelper(this.curText.shapeId, {
            fontFamily: state,
          });

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
          this.#setShapePropertyHelper(this.curText.shapeId, {
            fontSize: state,
          });

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
          this.#setShapePropertyHelper(this.curText.shapeId, {
            opacity: state,
          });
        }
      },
    );
    let sub14 = useToolStyle.subscribe(
      (state) => state.strokeColor,
      (state) => {
        if (this.curText) {
          this.currentInputElement.style.color = getStrokeColorString(state);
          this.#setShapePropertyHelper(this.curText.shapeId, {
            strokeColor: state,
          });
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
    //
    this.curSelection = new Selection(
      [this.selectionStart, this.selectionEnd],
      this.selectedShapes,
    );

    shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "addShape",
      shapeId: this.curSelection.shapeId,
      payload: { shape: this.curSelection },
    });

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
      if (this.curText)
        this.#setShapePropertyHelper(this.curText.shapeId, {
          text: this.currentInputElement.value,
        });

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

    if (this.currentTextDeleteSubscriptionId) {
      this.shapeManager.unsubsribeShapeUpdateEvents(
        this.currentTextDeleteSubscriptionId,
      );
      this.currentTextDeleteSubscriptionId = null;
    }

    this.selectedShapeDeleteSubscriptions.forEach((subscriptionId) => {
      this.shapeManager.unsubsribeShapeUpdateEvents(subscriptionId);
    });
    this.selectedShapeDeleteSubscriptions.clear();

    if (this.curText)
      this.editableTextContainer.current?.removeChild?.(
        this.currentInputElement,
      );
    this.shapeManager.handleShapeUpdateEvent({
      _id: crypto.randomUUID(),
      eventType: "deleteShape",
      shapeId: this.curSelection.shapeId,
    });
    document.body.style.cursor = "default";
  }

  handleDeleteAction() {
    if (this.curState == "selected") {
      this.selectedShapes.forEach((shape) =>
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "deleteShape",
          shapeId: shape.shapeId,
        }),
      );
      this.updateSelectedShapes([]);
      useSelectedShapes.setState({ selectedShapes: new Set() });

      this.curState = "idle";
    }
  }
  handleDuplicateAction() {
    if (this.curState == "selected") {
      let newSelection = this.curSelection!.clone();

      this.selectedShapes.forEach((shape) =>
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          shapeId: shape.shapeId,
          eventType: "updateEnclosingRectangle",
          payload: {
            toUpdate: "moveFull",
            delX: 10,
            delY: 10,
          },
        }),
      );

      newSelection.selectedShapes.forEach((shape) =>
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "addShape",
          shapeId: shape.shapeId,
          payload: { shape },
        }),
      );
    }
  }

  onSwitchTool(oldTool: ToolType): void {
    {
      if (oldTool == "cursor") {
        if (this.currentTextDeleteSubscriptionId) {
          this.shapeManager.unsubsribeShapeUpdateEvents(
            this.currentTextDeleteSubscriptionId,
          );
          this.currentTextDeleteSubscriptionId = null;
        }

        this.updateSelectedShapes([]);
        useSelectedShapes.setState({
          selectedShapes: new Set(),
        });

        if (this.curState == "selecting" || this.curState == "selected") {
          //
          this.updateSelectedShapes([]);
          this.updateSelectionArea({ x: 0, y: 0 }, { x: 0, y: 0 });
          this.#setShapePropertyHelper(this.curSelection.shapeId, {
            drawSelectionArea: false,
          });
        } else if (this.curState == "editingText") {
          this.updateCurrentTextEnclosingRectangle();

          this.#setShapePropertyHelper(this.curText!.shapeId, {
            text: this.currentInputElement.value,
            curState: "render",
          });

          this.currentInputElement.value = "";
          if (this.curText!.text.length == 0)
            this.shapeManager.handleShapeUpdateEvent({
              _id: crypto.randomUUID(),
              eventType: "deleteShape",
              shapeId: this.curText!.shapeId,
            });

          this.editableTextContainer.current?.removeChild(
            this.currentInputElement,
          );

          this.curText = null;
          if (this.currentTextDeleteSubscriptionId) {
            this.shapeManager.unsubsribeShapeUpdateEvents(
              this.currentTextDeleteSubscriptionId,
            );
            this.currentTextDeleteSubscriptionId = null;
          }
        }

        this.curState = "idle";
      }
    }
  }

  onCanvasMouseMove(e: globalMouseEvent) {
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
            this.curSelection!.isTopLeftCorner(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "nwse-resize";
          } else if (
            this.curSelection!.isTopRightCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "nesw-resize";
          } else if (
            this.curSelection!.isBottomLeftCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "nesw-resize";
          } else if (
            this.curSelection!.isBottomRightCorner(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "nwse-resize";
          } else if (
            this.curSelection!.isBottomBoundary(
              this.curPoint.x,
              this.curPoint.y,
            )
          ) {
            document.body.style.cursor = "ns-resize";
          } else if (
            this.curSelection!.isLeftBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ew-resize";
          } else if (
            this.curSelection!.isRightBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ew-resize";
          } else if (
            this.curSelection!.isTopBoundary(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "ns-resize";
          } else if (
            this.curSelection!.containsPoint(this.curPoint.x, this.curPoint.y)
          ) {
            document.body.style.cursor = "move";
          } else {
            document.body.style.cursor = "default";
          }
        }
        break;
      case "selecting":
        {
          this.updateSelectionArea(this.selectionStart, { ...this.curPoint });

          if (!isSamePoint(this.selectionEnd, this.selectionStart)) {
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

          this.curSelectionPositionUpdaters.moveEnclosingRectangle(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopBoundary":
        {
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveTopBoundary(dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomBoundary":
        {
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveBottomBoundary(dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingRightBoundary":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          this.curSelectionPositionUpdaters.moveRightBoundary(delx);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingLeftBoundary":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          this.curSelectionPositionUpdaters.moveLeftBoundary(delx);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopLeftCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveTopLeftCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomRightCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveBottomRightCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingTopRightCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveTopRightCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;
      case "movingBottomLeftCorner":
        {
          let delx =
            this.curPoint.x - this.curSelectionMovementInfo.lastPoint.x;
          let dely =
            this.curPoint.y - this.curSelectionMovementInfo.lastPoint.y;
          this.curSelectionPositionUpdaters.moveBottomLeftCorner(delx, dely);

          this.curSelectionMovementInfo.lastPoint = { ...this.curPoint };
        }
        break;

      default:
        break;
    }
  }
  onCanvasMouseDown(e: globalMouseEvent) {
    this.curPoint.x = Math.floor(e.x);
    this.curPoint.y = Math.floor(e.y);

    switch (this.curState) {
      case "idle":
        {
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

            this.#setShapePropertyHelper(this.curSelection.shapeId, {
              drawSelectionArea: false,
            });
          } else {
            this.curState = "selecting";

            this.updateSelectionArea(
              { ...this.curPoint },
              { ...this.curPoint },
            );

            this.updateSelectedShapes([]);
            useSelectedShapes.setState({ selectedShapes: new Set() });

            this.#setShapePropertyHelper(this.curSelection.shapeId, {
              drawSelectionArea: true,
            });
          }
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

            this.updateSelectionArea(
              { ...this.curPoint },
              { ...this.curPoint },
            );

            this.updateSelectedShapes([]);
            useSelectedShapes.setState({ selectedShapes: new Set() });

            this.#setShapePropertyHelper(this.curSelection.shapeId, {
              drawSelectionArea: true,
            });
          }
        }
        break;
      default:
        break;
    }
  }
  onCanvasMouseUp(e: globalMouseEvent) {
    this.curPoint.x = Math.floor(e.x);
    this.curPoint.y = Math.floor(e.y);

    switch (this.curState) {
      case "editingText":
        {
          this.curState = "idle";
          useSelectedShapes.setState({ selectedShapes: new Set() });

          this.updateCurrentTextEnclosingRectangle();

          this.#setShapePropertyHelper(this.curText!.shapeId, {
            text: this.currentInputElement.value,
            curState: "render",
          });

          this.currentInputElement.value = "";
          if (this.curText!.text.length == 0)
            this.shapeManager.handleShapeUpdateEvent({
              _id: crypto.randomUUID(),
              eventType: "deleteShape",
              shapeId: this.curText!.shapeId,
            });

          this.editableTextContainer.current?.removeChild(
            this.currentInputElement,
          );

          if (this.currentTextDeleteSubscriptionId) {
            this.shapeManager.unsubsribeShapeUpdateEvents(
              this.currentTextDeleteSubscriptionId,
            );
            this.currentTextDeleteSubscriptionId = null;
          }

          this.curText = null;
        }
        break;
      case "selecting":
        {
          this.#setShapePropertyHelper(this.curSelection.shapeId, {
            drawSelectionArea: false,
          });

          if (this.selectedShapes.length > 0) {
            this.curState = "selected";
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
              this.curText = new Text("edit", "", [
                { x: curPoint.x, y: curPoint.y },
                { x: curPoint.x, y: curPoint.y },
              ]);

              this.shapeManager.handleShapeUpdateEvent({
                _id: crypto.randomUUID(),
                eventType: "addShape",
                shapeId: this.curText.shapeId,
                payload: { shape: this.curText },
              });

              this.currentTextDeleteSubscriptionId =
                this.shapeManager.subsribeShapeUpdateEvents(
                  this.curText.shapeId,
                  "deleteShape",
                  this.handleCurrentTextDeleted.bind(this),
                );

              this.currentInputElement.value = this.curText.text;

              this.currentInputElement.style.position = "absolute";

              const { x: offsetX, y: offsetY } = useGrabToolPosition.getState();
              this.currentInputElement.style.top = `${this.curText.getEnclosingRectangle()[1] + offsetY}px`;
              this.currentInputElement.style.left = `${this.curText.getEnclosingRectangle()[0] + offsetX}px`;

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

              this.#setShapePropertyHelper(this.curText.shapeId, {
                curState: "edit",
              });

              this.currentInputElement.select();
              this.curtextEditingInitiliazeInfo.reset();
            } else {
              this.curState = "idle";
              this.curtextEditingInitiliazeInfo.lastMouseup.x = this.curPoint.x;
              this.curtextEditingInitiliazeInfo.lastMouseup.y = this.curPoint.y;
              this.curtextEditingInitiliazeInfo.lastTime = new Date();
              this.curtextEditingInitiliazeInfo.lastWasEmtpyArea = true;
            }
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

              this.currentTextDeleteSubscriptionId =
                this.shapeManager.subsribeShapeUpdateEvents(
                  this.curText.shapeId,
                  "deleteShape",
                  this.handleCurrentTextDeleted.bind(this),
                );

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

              this.#setShapePropertyHelper(this.curText.shapeId, {
                curState: "edit",
              });

              this.currentInputElement.select();
              this.curtextEditingInitiliazeInfo.reset();
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
  onOtherMouseMove(e: globalMouseEvent): void {
    if (this.curState != "editingText") this.onCanvasMouseMove(e);
  }
  onOtherMouseUp(e: globalMouseEvent): void {
    if (this.curState != "editingText") this.onCanvasMouseUp(e);
  }
}
