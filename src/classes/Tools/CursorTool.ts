import type ShapeManager from "../Managers/ShapeManager";
import type { EventType } from "../Managers/ToolManager";
import type Tool from "./Tool";
import type { Tool as ToolType } from "../../store/Tools.store";

type state = "idle" | "drawing";
export default class CursorTool implements Tool {
  toolType: ToolType = "cursor";

  shapeManager: ShapeManager;
  curState: state = "idle";

  emit: (tool: ToolType, event: EventType) => void;
  constructor(
    shapeManager: ShapeManager,
    emit: (tool: ToolType, event: EventType) => void,
  ) {
    this.shapeManager = shapeManager;
    this.emit = emit;
  }
  onSwitchTool( oldTool: ToolType, newTool: ToolType ): void {
    
  }
  destructor(): void {}
  onCanvasMouseDown(e: MouseEvent) {}

  onCanvasMouseMove(e: MouseEvent) {
    if (this.curState == "drawing") {
    }
  }
  onCanvasMouseUp(e: MouseEvent) {}

  onOtherMouseDown(e: MouseEvent): void {}
  onOtherMouseMove(e: MouseEvent): void {}
  onOtherMouseUp(e: MouseEvent): void {}
}
