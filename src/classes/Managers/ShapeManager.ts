import type { Point } from "../Shapes/Point";
import type { Shape, shapeId } from "../Shapes/Shape";
import type {
  eventType,
  shapeUpdateEvent,
} from "../../types/shapeUpdateEvents";

type shapeUpdateSubscriptionInfo =
  | { eventType: "addShape" }
  | { eventType: "removeShape"; shapeId: shapeId }
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
  unsubscribeToShapeUpdateEvent() {}

  handleShapeUpdateEvent(op: shapeUpdateEvent) {
    switch (op.eventType) {
      case "addShape":
        {
          this.shapes[op.payload.shape.shapeId] = op.payload.shape;
        }
        break;

      case "deleteShape":
        {
          delete this.shapes[op.shapeId];
        }
        break;

      default:
        this.shapes[op.shapeId].applyUpdateEvent(op);
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
