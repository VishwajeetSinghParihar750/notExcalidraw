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
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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

type eventType =
  | "updateEnclosingRectangle"
  | "updateProperty"
  | "deleteShape"
  | "addShape";

type shapeUpdateEvent =
  | {
      eventType: "updateEnclosingRectangle";
      shapeId: shapeId;
      payload: updateEnclosingRectangleSchema;
    }
  | {
      eventType: "updateProperty";
      shapeId: shapeId;
      payload: updatePropertySchema;
    };

export type {
  shapeUpdateEvent,
  updateEnclosingRectangleSchema,
  updatePropertySchema,
  eventType,
};
