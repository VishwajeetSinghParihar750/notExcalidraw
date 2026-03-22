import type { Point } from "../Shapes/Point";
import type { Shape, shapeId } from "../Shapes/Shape";
import type {
  eventType,
  shapeUpdateEvent,
  shapeUpdateEventId,
} from "../../types/shapeUpdateEvents";
import type { opacity } from "../../store/Tools.store";

type shapeUpdateSubscriptionInfo =
  | { eventType: "addShape" }
  | { eventType: "deleteShape"; shapeId: shapeId }
  | { eventType: "updateEnclosingRectangle"; shapeId: shapeId }
  | { eventType: "updateProperty"; shapeId: shapeId };

type shapeUpdateSubscriptionCallback = (
  shapeUpdateEvent: shapeUpdateEvent,
) => void;

type shapeIdToCallbackArrayMapping = Partial<
  Record<shapeId, shapeUpdateSubscriptionCallback[]>
>;
type shapeUpdateSubscriptionId = string;
type shapeUpdateEventSubscriptions = {
  addShape?: shapeUpdateSubscriptionCallback[];
  removeShape?: shapeIdToCallbackArrayMapping;
  updateEnclosingRectangle?: shapeIdToCallbackArrayMapping;
  updateProperty?: shapeIdToCallbackArrayMapping;
};

type shapeUpdateEventSubscription = Partial<
  Record<eventType, shapeUpdateSubscriptionCallback>
>;

type shapeUpdateEventSubscriptionsIdMapping = Partial<
  Record<shapeUpdateSubscriptionId, shapeUpdateEventSubscription>
>;

export default class ShapeManager {
  shapes: Record<shapeId, Shape> = {};

  shapeUpdateEventSubscriptions: shapeUpdateEventSubscriptions = {};
  shapeUpdateEventSubscriptionsById: shapeUpdateEventSubscriptionsIdMapping =
    {};

  // subscribeToShapeUpdateEvent(
  //   shapeUpdateSubscriptionInfo: shapeUpdateSubscriptionInfo,
  //   shapeUpdateSubscriptionCallback: shapeUpdateSubscriptionCallback,
  // ): shapeUpdateSubscriptionId {
  //   switch (shapeUpdateSubscriptionInfo.eventType) {
  //     case "addShape":
  //       {
  //         if (!this.shapeUpdateEventSubscriptions.addShape)
  //           this.shapeUpdateEventSubscriptions.addShape = [];

  //         this.shapeUpdateEventSubscriptions.addShape.push(
  //           shapeUpdateSubscriptionCallback,
  //         );

  //         let id = crypto.randomUUID();
  //         this.shapeUpdateEventSubscriptionsById[id] = {};
  //       }

  //       break;

  //     default:
  //       {
  //         if (
  //           !this.shapeUpdateEventSubscriptions[
  //             shapeUpdateSubscriptionInfo.eventType
  //           ]
  //         ) {
  //           this.shapeUpdateEventSubscriptions[
  //             shapeUpdateSubscriptionInfo.eventType
  //           ] = {};
  //         }

  //         if (
  //           !this.shapeUpdateEventSubscriptions[
  //             shapeUpdateSubscriptionInfo.eventType
  //           ]?.[shapeUpdateSubscriptionInfo.shapeId]
  //         )
  //           this.shapeUpdateEventSubscriptions[
  //             shapeUpdateSubscriptionInfo.eventType
  //           ]![shapeUpdateSubscriptionInfo.shapeId] = [];

  //         this.shapeUpdateEventSubscriptions[
  //           shapeUpdateSubscriptionInfo.eventType
  //         ]?.[shapeUpdateSubscriptionInfo.shapeId]?.push(
  //           shapeUpdateSubscriptionCallback,
  //         );
  //       }
  //       break;
  //   }
  // }

  shapeUpdateEvents: Record<shapeUpdateEventId, shapeUpdateEvent> = {};
  shapeUpdateEventsInverse: Record<shapeUpdateEventId, shapeUpdateEvent> = {}; // og event id mapped to inverse event

  unsubscribeToShapeUpdateEvent() {}
  destructor() {}

  handleShapeUpdateEvent(op: shapeUpdateEvent) {
    switch (op.eventType) {
      case "addShape":
        {
          this.shapeUpdateEventsInverse[op._id] = {
            _id: crypto.randomUUID(),
            eventType: "deleteShape",
            shapeId: op.payload.shape.shapeId,
          };
          this.shapes[op.payload.shape.shapeId] = op.payload.shape;
        }
        break;

      case "deleteShape":
        {
          this.shapeUpdateEventsInverse[op._id] = {
            _id: crypto.randomUUID(),
            eventType: "addShape",
            payload: { shape: this.shapes[op.shapeId] },
          };
          delete this.shapes[op.shapeId];
        }
        break;
      case "updateEnclosingRectangle":
        {
          let [x1, y1, x2, y2] =
            this.shapes[op.shapeId].getEnclosingRectangle();

          this.shapeUpdateEventsInverse[op._id] = {
            _id: crypto.randomUUID(),
            eventType: "updateEnclosingRectangle",
            shapeId: op.shapeId,
            payload: { toUpdate: "updateFull", x1, y1, x2, y2 },
          };

          this.shapes[op.shapeId].applyUpdateEvent(op);
        }
        break;
      case "updateProperty":
        {
          let curShape = this.shapes[op.shapeId];
          this.shapeUpdateEventsInverse[op._id] = {
            _id: crypto.randomUUID(),
            eventType: "updateProperty",
            shapeId: op.shapeId,
            payload: Object.keys(op.payload).reduce((prevVal, key) => {
              return {
                key: curShape[key as keyof typeof curShape],
                ...prevVal,
              };
            }, {}),
          };

          this.shapes[op.shapeId].applyUpdateEvent(op);
        }
        break;
      default:
        break;
    }
  }

  getShapesAt(x: number, y: number): Shape[] {
    return Object.values(this.shapes).filter((shape) =>
      shape.containsPoint(x, y),
    );
  }
  getShapesInside(point1: Point, point2: Point) {
    return Object.values(this.shapes).filter((shape) =>
      shape.liesInside(point1, point2),
    );
  }
}
