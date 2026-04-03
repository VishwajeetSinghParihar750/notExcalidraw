import type { shapeUpdateEvent } from "../../types/shapeUpdateEvents";
import type { Point } from "./Point";

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

  abstract serialize(): any;
}
