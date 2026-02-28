import type { opacity } from "../../store/Tools.store";

export interface Shape {
  opacity: opacity;
  setOpacity: (opacity: opacity) => void;

  draw: (ctx: CanvasRenderingContext2D) => void;
  containsPoint: (x: number, y: number) => boolean;
}
