import type { Tool as ToolType } from "../../store/Tools.store";
import type { globalMouseEvent } from "../../utils/GlobalMouseEvents";
export default interface Tool {
  toolType: ToolType;
  onCanvasMouseDown(e: globalMouseEvent): void;
  onCanvasMouseUp(e: globalMouseEvent): void;
  onCanvasMouseMove(e: globalMouseEvent): void;
  onOtherMouseDown(e: globalMouseEvent): void;
  onOtherMouseUp(e: globalMouseEvent): void;
  onOtherMouseMove(e: globalMouseEvent): void;
  destructor(): void;
  reset(): void;
  onSwitchTool(oldTool: ToolType, newTool: ToolType): void;
}
