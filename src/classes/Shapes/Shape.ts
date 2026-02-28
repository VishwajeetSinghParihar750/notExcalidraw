import type { opacity } from "../../store/Tools.store";

export type ShapeType =
  | "arrow"
  | "line"
  | "rect"
  | "rotrect"
  | "pen"
  | "text"
  | "circle";
export interface Shape {
  shapeType: ShapeType;

  opacity: opacity;
  setOpacity: (opacity: opacity) => void;

  draw: (ctx: CanvasRenderingContext2D) => void;
  containsPoint: (x: number, y: number) => boolean;
}
