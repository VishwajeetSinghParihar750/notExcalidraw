import z from "zod";

const TextShapeState = z.enum(["render", "edit"]);

const fillStyle = z.enum(["line", "crosslines", "fill"]);

const strokeStyle = z.enum(["line", "dotted", "smalldotted"]);

const arrowType = z.enum(["straight", "curve", "snake"]);

const strokeWidth = z.union([z.literal(2), z.literal(4), z.literal(6)]);

const edgeRadius = z.union([z.literal(0), z.literal(10)]);

const opacity = z.union([
  z.literal(0),
  z.literal(10),
  z.literal(20),
  z.literal(30),
  z.literal(40),
  z.literal(50),
  z.literal(60),
  z.literal(70),
  z.literal(80),
  z.literal(90),
  z.literal(100),
]);

const backgroundColor = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const strokeColor = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const fontFamily = z.enum(["hand", "code", "normal"]);

const fontSize = z.union([
  z.enum(["small", "medium", "large", "extra-large"]),
  z.number(),
]);

const toUpdateEnum = z.enum(["updateFull", "moveFull"]);

const updateEnclosingRectanglePayload = z.object({
  toUpdate: toUpdateEnum,

  delX: z.number().optional(),
  delY: z.number().optional(),
  x1: z.number().optional(),
  y1: z.number().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
});

const updatePropertyPayload = z.object({
  //styles
  fillStyle: fillStyle.optional(),
  strokeStyle: strokeStyle.optional(),
  arrowType: arrowType.optional(),
  strokeWidth: strokeWidth.optional(),
  edgeRadius: edgeRadius.optional(),
  opacity: opacity.optional(),
  backgroundColor: backgroundColor.optional(),
  strokeColor: strokeColor.optional(),
  fontFamily: fontFamily.optional(),
  fontSize: fontSize.optional(),

  //properties
  points: z.array(z.unknown()).optional(),
  text: z.string().optional(),
  curState: TextShapeState.optional(),
});

const addShapePayload = z.object({
  shape: z.string(),
});
const shapeUpdateEventId = z.string();
const shapeId = z.string();

const shapeUpdateEvent = z.union([
  z.object({
    _id: shapeUpdateEventId,
    eventType: z.literal("updateEnclosingRectangle"),
    shapeId: shapeId,
    payload: updateEnclosingRectanglePayload,
  }),
  z.object({
    _id: shapeUpdateEventId,
    eventType: z.literal("updateProperty"),
    shapeId: shapeId,
    payload: updatePropertyPayload,
  }),
  z.object({
    _id: shapeUpdateEventId,
    shapeId: shapeId,
    eventType: z.literal("addShape"),
    payload: addShapePayload,
  }),
  z.object({
    _id: shapeUpdateEventId,
    eventType: z.literal("deleteShape"),
    shapeId: shapeId,
  }),
]);

// actual types
const getCurrentStateSchema = z.object({
  type: z.literal("getCurrentState"),
});
const eventAddedSchema = z.object({
  type: z.literal("eventAdded"),
  payload: z.object({
    addedEvent: shapeUpdateEvent,
    prevEventId: shapeUpdateEventId,
  }),
});
const addEventFailedSchema = z.object({
  type: z.literal("addEventFailed"),
  payload: z.object({
    addEventId: shapeUpdateEventId,
  }),
});

const setCurrentStateSchema = z.object({
  type: z.literal("setCurrentSchema"),
  payload: z.object({
    events: z.array(shapeUpdateEvent),
  }),
});

const clientErrorSchema = z.object({
  type: z.literal("clientError"),
  payload: z.object({
    message: z.string(),
  }),
});
const serverErrorSchema = z.object({
  type: z.literal("serverError"),
  payload: z.object({
    message: z.string(),
  }),
});
const roomJoinedSchema = z.object({
  type: z.literal("roomJoined"),
});

const webSocketMessageSchema = z.union([
  serverErrorSchema,
  clientErrorSchema,
  setCurrentStateSchema,
  addEventFailedSchema,
  eventAddedSchema,
  getCurrentStateSchema,
  roomJoinedSchema,
]);

export {
  shapeUpdateEvent,
  shapeUpdateEventId,
  serverErrorSchema,
  clientErrorSchema,
  setCurrentStateSchema,
  addEventFailedSchema,
  eventAddedSchema,
  getCurrentStateSchema,
  roomJoinedSchema,
  webSocketMessageSchema,
};
