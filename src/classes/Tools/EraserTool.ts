import type { opacity } from "../../store/Tools.store";
import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import type { Shape } from "../Shapes/Shape";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "erasing";
export default class EraserTool implements Tool {
  toolType: ToolType = "eraser";

  shapeManager: ShapeManager;
  curState: state = "idle";
  currentToEraseShapes: Set<Shape> = new Set();

  emit: (tool: ToolType, event: EventType) => void;
  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }

  destructor(): void {
    document.body.style.cursor = "default";
  }
  reset(): void {
    this.curState = "idle";
    this.currentToEraseShapes = new Set();
    document.body.style.cursor = "default";
  }

  onCanvasMouseDown() {
    this.curState = "erasing";
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (this.curState == "erasing") {
      document.body.style.cursor = "grab";

      let shapes = this.shapeManager.getShapesAt(e.clientX, e.clientY);
      for (let shape of shapes) {
        if (!this.currentToEraseShapes.has(shape)) {
          this.currentToEraseShapes.add(shape);
          if ((shape as any).setOpacity) {
            this.shapeManager.handleShapeUpdateEvent({
              _id: crypto.randomUUID(),
              eventType: "updateProperty",
              shapeId: shape.shapeId,
              payload: {
                opacity: Math.max(0, (shape as any).opacity - 50) as opacity,
              },
            });
          }
        }
      }
    } else document.body.style.cursor = "default";
  }
  onCanvasMouseUp() {
    if (this.curState == "erasing") {
      this.curState = "idle";

      this.currentToEraseShapes.forEach((shape) =>
        this.shapeManager.handleShapeUpdateEvent({
          _id: crypto.randomUUID(),
          eventType: "deleteShape",
          shapeId: shape.shapeId,
        }),
      );

      this.currentToEraseShapes.clear();

      // this.emit(this.toolType, "taskComplete");
    }
  }
  onOtherMouseDown(): void {}
  onOtherMouseMove(): void {
    document.body.style.cursor = "default";
  }
  onOtherMouseUp(): void {}

  onSwitchTool(): void {}
}
