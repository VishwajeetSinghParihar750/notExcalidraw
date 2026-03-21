import type { Point } from "../classes/Shapes/Point";
import type { Shape, shapeId } from "../classes/Shapes/Shape";
import type { TextShapeState } from "../classes/Shapes/Text";
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
} from "../store/Tools.store";

type updateEnclosingRectangleSchema = {
  toUpdate:
    | "updateFull"
    | "moveFull"
    | "topBoundary"
    | "bottomBoundary"
    | "leftBoundary"
    | "rightBoundary"
    | "topLeftCorner"
    | "topRightCorner"
    | "bottomLeftCorner"
    | "bottomRightCorner";

  delX?: number;
  delY?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number; // either send new coords or change to coords
};

type updatePropertySchema = {
  //styles
  fillStyle?: fillStyle;
  strokeStyle?: strokeStyle;
  arrowType?: arrowType;
  strokeWidth?: strokeWidth;
  edgeRadius?: edgeRadius;
  opacity?: opacity;
  backgroundColor?: backgroundColor;
  strokeColor?: strokeColor;
  fontFamily?: fontFamily;
  fontSize?: fontSize;

  //properties
  points?: Point[];
  selectedShapes?: Shape[];
  selectedArea?: [Point, Point];
  text?: string;
  curState?: TextShapeState;
  drawSelectionArea?: boolean;
};

type addShapeSchema = {
  shape: Shape;
};

type eventType =
  | "updateEnclosingRectangle"
  | "updateProperty"
  | "deleteShape"
  | "addShape";

type shapeUpdateEvent =
  | {
      _id: string;
      eventType: "updateEnclosingRectangle";
      shapeId: shapeId;
      payload: updateEnclosingRectangleSchema;
    }
  | {
      _id: string;
      eventType: "updateProperty";
      shapeId: shapeId;
      payload: updatePropertySchema;
    }
  | {
      _id: string;
      eventType: "addShape";
      payload: addShapeSchema;
    }
  | {
      _id: string;
      eventType: "deleteShape";
      shapeId: shapeId;
    };

export type {
  shapeUpdateEvent,
  updateEnclosingRectangleSchema,
  updatePropertySchema,
  eventType,
};
