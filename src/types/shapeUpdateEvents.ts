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
  toUpdate: "updateFull" | "moveFull";

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
type shapeUpdateEventId = string;
type shapeUpdateEvent =
  | {
      _id: shapeUpdateEventId;
      eventType: "updateEnclosingRectangle";
      shapeId: shapeId;
      payload: updateEnclosingRectangleSchema;
    }
  | {
      _id: shapeUpdateEventId;
      eventType: "updateProperty";
      shapeId: shapeId;
      payload: updatePropertySchema;
    }
  | {
      _id: shapeUpdateEventId;
      shapeId: shapeId;
      eventType: "addShape";
      payload: addShapeSchema;
    }
  | {
      _id: shapeUpdateEventId;
      eventType: "deleteShape";
      shapeId: shapeId;
    };

export type {
  shapeUpdateEvent,
  updateEnclosingRectangleSchema,
  updatePropertySchema,
  eventType,
  shapeUpdateEventId,
};
