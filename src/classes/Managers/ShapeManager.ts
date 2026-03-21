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
  shapes: Shape[] = [];

  shapeUpdateEventSubscriptions: shapeUpdateEventSubscriptions = {};
  shapeUpdateEventSubscriptionsById: shapeUpdateEventSubscriptionsIdMapping =
    {};

  subscribeToShapeUpdateEvent(
    shapeUpdateSubscriptionInfo: shapeUpdateSubscriptionInfo,
    shapeUpdateSubscriptionCallback: shapeUpdateSubscriptionCallback,
  ): shapeUpdateSubscriptionId {
    switch (shapeUpdateSubscriptionInfo.eventType) {
      case "addShape":
        {
          if (!this.shapeUpdateEventSubscriptions.addShape)
            this.shapeUpdateEventSubscriptions.addShape = [];

          this.shapeUpdateEventSubscriptions.addShape.push(
            shapeUpdateSubscriptionCallback,
          );

          let id = crypto.randomUUID();
          this.shapeUpdateEventSubscriptionsById[id] = {};
        }

        break;

      default:
        {
          if (
            !this.shapeUpdateEventSubscriptions[
              shapeUpdateSubscriptionInfo.eventType
            ]
          ) {
            this.shapeUpdateEventSubscriptions[
              shapeUpdateSubscriptionInfo.eventType
            ] = {};
          }

          if (
            !this.shapeUpdateEventSubscriptions[
              shapeUpdateSubscriptionInfo.eventType
            ]?.[shapeUpdateSubscriptionInfo.shapeId]
          )
            this.shapeUpdateEventSubscriptions[
              shapeUpdateSubscriptionInfo.eventType
            ]![shapeUpdateSubscriptionInfo.shapeId] = [];

          this.shapeUpdateEventSubscriptions[
            shapeUpdateSubscriptionInfo.eventType
          ]?.[shapeUpdateSubscriptionInfo.shapeId]?.push(
            shapeUpdateSubscriptionCallback,
          );
        }
        break;
    }
  }
  unsubscribeToShapeUpdateEvent() {}

  addShape(shape: Shape) {
    this.shapes.push(shape);
  }
  removeShape(id: shapeId) {
    this.shapes = this.shapes.filter((v) => v.shapeId != id);
  }

  handleShapeUpdateEvent(op: shapeUpdateEvent) {
    switch (op.eventType) {
      case "updateEnclosingRectangle":
        {
        }
        break;

      case "updateProperty":
        {
        }
        break;

      default:
        break;
    }
  }

  getShapesAt(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => shape.containsPoint(x, y));
  }
  getShapesInside(point1: Point, point2: Point) {
    return this.shapes.filter((shape) => shape.liesInside(point1, point2));
  }
}
