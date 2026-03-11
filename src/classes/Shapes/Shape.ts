import type {
  arrowType,
  backgroundColor,
  edgeRadius,
  fillStyle,
  fontFamily,
  fontSize,
  opacity,
  strokeColor,
  strokeStyle,
  strokeWidth,
} from "../../store/Tools.store";
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

  draw: (ctx: CanvasRenderingContext2D) => void;
  containsPoint: (x: number, y: number) => boolean;
  liesInside: (point1: Point, point2: Point) => boolean;

  getEnclosingRectangle: () => [number, number, number, number];
  updateEnclosingRectangle: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => void;

  moveEnclosingRectangle: (delX: number, delY: number) => void;

  setEdgeRadius?: (radius: edgeRadius) => void;
  setStrokeColor?: (color: strokeColor) => void;
  setStrokeWidth?: (width: strokeWidth) => void;
  setStrokeStyle?: (style: strokeStyle) => void;
  setOpacity?: (opacity: opacity) => void;
  setArrowType?: (arrowType: arrowType) => void;
  setBackgroundColor?: (color: backgroundColor) => void;
  setFillStyle?: (style: fillStyle) => void;
  setFontFamily?: (fontFamily: fontFamily) => void;
  setFontSize?: (fontSize: fontSize) => void;
}
