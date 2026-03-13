import type { Tool as ToolType } from "../../store/Tools.store";
export default interface Tool {
  toolType: ToolType;
  onCanvasMouseDown(e: MouseEvent): void;
  onCanvasMouseUp(e: MouseEvent): void;
  onCanvasMouseMove(e: MouseEvent): void;
  onOtherMouseDown(e: MouseEvent): void;
  onOtherMouseUp(e: MouseEvent): void;
  onOtherMouseMove(e: MouseEvent): void;
  destructor(): void;
  reset(): void;
  onSwitchTool(oldTool: ToolType, newTool: ToolType): void;
}
