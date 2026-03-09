import type { opacity } from "../../store/Tools.store";
import type { Point } from "./Point";

export type ShapeType =
  | "arrow"
  | "line"
  | "rect"
  | "rotrect"
  | "pen"
  | "text"
  | "circle"
  | "selection";
export interface Shape {
  shapeType: ShapeType;

  opacity?: opacity;
  setOpacity?: (opacity: opacity) => void;

  draw: (ctx: CanvasRenderingContext2D) => void;
  containsPoint: (x: number, y: number) => boolean;
  liesInside: (point1: Point, point2: Point) => boolean;
  getEnclosingRectangle: () => [number, number, number, number];
  moveEnclosingRectangle: (delX: number, delY: number) => void;
}
