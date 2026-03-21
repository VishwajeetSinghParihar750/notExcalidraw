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
import type { shapeUpdateEvent } from "../../types/shapeUpdateEvents";
import type { Arrow } from "./Arrow";
import type { Circle } from "./Circle";
import type { Line } from "./Line";
import type { Pen } from "./Pen";
import type { Point } from "./Point";
import type { Rectangle } from "./Rectangle";
import type { RotatedRecangle } from "./RotatedRectangle";
import type { Text } from "./Text";

export type shapeId = string;
export type ShapeType =
  | "arrow"
  | "line"
  | "rect"
  | "rotrect"
  | "pen"
  | "text"
  | "circle"
  | "selection";

export type ShapeData = {
  shapeType: ShapeType;
  shapeId: shapeId;

  //styles
  opacity?: opacity;
  fillStyle?: fillStyle;
  strokeStyle?: strokeStyle;
  arrowType?: arrowType;
  strokeWidth?: strokeWidth;
  edgeRadius?: edgeRadius;
  backgroundColor?: backgroundColor;
  strokeColor?: strokeColor;
  fontFamily?: fontFamily;
  fontSize?: fontSize;

  // properties
  points?: Point[];
};

export abstract class Shape {
  abstract shapeType: ShapeType;
  abstract shapeId: shapeId;

  // geometry
  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract containsPoint(x: number, y: number): boolean;
  abstract liesInside(point1: Point, point2: Point): boolean;

  abstract getEnclosingRectangle(): [number, number, number, number];
  abstract updateEnclosingRectangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): void;

  abstract moveEnclosingRectangle(delX: number, delY: number): void;

  abstract clone(): Shape;

  // for updates through events
  abstract applyUpdateEvent(shapeUpdateEvent: shapeUpdateEvent): void;
}

export function serializeShape(shape: Shape) {
  switch (shape.shapeType) {
    case "rect": {
      const s = shape as Rectangle;

      return {
        shapeType: "rect",
        shapeId: s.shapeId,

        startX: s.startX,
        startY: s.startY,
        endX: s.endX,
        endY: s.endY,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,

        backgroundColor: s.backgroundColor,
        fillStyle: s.fillStyle,

        opacity: s.opacity,
        edgeRadius: s.edgeRadius,
      };
    }

    case "rotrect": {
      const s = shape as RotatedRecangle;

      return {
        shapeType: "rotrect",
        shapeId: s.shapeId,

        startX: s.startX,
        startY: s.startY,
        endX: s.endX,
        endY: s.endY,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,

        backgroundColor: s.backgroundColor,
        fillStyle: s.fillStyle,

        opacity: s.opacity,
        edgeRadius: s.edgeRadius,
      };
    }

    case "circle": {
      const s = shape as Circle;

      return {
        shapeType: "circle",
        shapeId: s.shapeId,

        startX: s.startX,
        startY: s.startY,
        endX: s.endX,
        endY: s.endY,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,

        backgroundColor: s.backgroundColor,
        fillStyle: s.fillStyle,

        opacity: s.opacity,
      };
    }

    case "line": {
      const s = shape as Line;

      return {
        shapeType: "line",
        shapeId: s.shapeId,

        points: s.points,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,

        opacity: s.opacity,
      };
    }

    case "arrow": {
      const s = shape as Arrow;

      return {
        shapeType: "arrow",
        shapeId: s.shapeId,

        points: s.points,

        arrowType: s.arrowType,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,

        opacity: s.opacity,
      };
    }

    case "pen": {
      const s = shape as Pen;

      return {
        shapeType: "pen",
        shapeId: s.shapeId,

        points: s.points,

        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,

        backgroundColor: s.backgroundColor,
        fillStyle: s.fillStyle,

        opacity: s.opacity,
      };
    }

    case "text": {
      const s = shape as Text;

      return {
        shapeType: "text",
        shapeId: s.shapeId,

        text: s.text,

        enclosingRectangle: s.getEnclosingRectangle,

        fontFamily: s.fontFamily,
        fontSize: s.fontSize,

        strokeColor: s.strokeColor,
        opacity: s.opacity,
      };
    }

    default:
      throw new Error("Unknown shape type");
  }
}
