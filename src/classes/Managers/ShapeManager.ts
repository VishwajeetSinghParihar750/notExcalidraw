import type { Point } from "../Shapes/Point";
import type { Shape, shapeId } from "../Shapes/Shape";
import type {
  eventType,
  shapeUpdateEvent,
  shapeUpdateEventId,
} from "../../types/shapeUpdateEvents";
import type z from "zod";
import { shapeUpdateEvent as shapeUpdateEventZod } from "../../types/wsZodSchemas";

type shapeUpdateSubId = string;
type shapeUpdateSubCallback = (event: shapeUpdateEvent) => void;
type subsInfo = shapeUpdateSubCallback[];
type subsEventMapping = Partial<Record<"all" | eventType, subsInfo>>;
type shapeUpdateSubs = Partial<Record<"all" | shapeId, subsEventMapping>>;

export default class ShapeManager {
  shapes: Record<shapeId, Shape> = {};

  addOrDeleteShapeUpdateEvents: shapeUpdateEvent[] = [];
  perShapeUpdateEvents: Record<string, shapeUpdateEvent[]> = {};
  shapeUpdateEvents: shapeUpdateEvent[] = [];

  shapeUpdateEventsInverse: Record<shapeUpdateEventId, shapeUpdateEvent> = {}; // og event id mapped to inverse event

  shapeUpdateEventSubscriptions: shapeUpdateSubs = {};
  shapeUpdateEventSubscriptionsInfo: Record<
    shapeUpdateSubId,
    {
      shape: shapeId | "all";
      event: eventType | "all";
      cb: shapeUpdateSubCallback;
    }
  > = {};

  subsribeShapeUpdateEvents(
    shape: "all" | shapeId,
    event: "all" | eventType,
    shapeUpdateSubCallback: shapeUpdateSubCallback,
  ): shapeUpdateSubId {
    let subId = crypto.randomUUID();

    if (!this.shapeUpdateEventSubscriptions[shape]) {
      this.shapeUpdateEventSubscriptions[shape] = { [event]: [] };
    } else if (!this.shapeUpdateEventSubscriptions[shape][event])
      this.shapeUpdateEventSubscriptions[shape][event] = [];

    this.shapeUpdateEventSubscriptionsInfo[subId] = {
      shape,
      event,
      cb: shapeUpdateSubCallback,
    };
    this.shapeUpdateEventSubscriptions[shape][event]!.push(
      shapeUpdateSubCallback,
    );

    return subId;
  }

  unsubsribeShapeUpdateEvents(shapeUpdateSubId: shapeUpdateSubId) {
    let subInfo = this.shapeUpdateEventSubscriptionsInfo[shapeUpdateSubId];
    if (
      subInfo &&
      this.shapeUpdateEventSubscriptions[subInfo.shape]?.[subInfo.event]
    ) {
      this.shapeUpdateEventSubscriptions[subInfo.shape]![subInfo.event] =
        this.shapeUpdateEventSubscriptions[subInfo.shape]![
          subInfo.event
        ]?.filter((cb) => cb != subInfo.cb);

      delete this.shapeUpdateEventSubscriptionsInfo[shapeUpdateSubId];

      if (
        this.shapeUpdateEventSubscriptions[subInfo.shape]?.[subInfo.event]
          ?.length == 0
      ) {
        delete this.shapeUpdateEventSubscriptions[subInfo.shape]?.[
          subInfo.event
        ];
      }
      if (
        Object.keys(
          this.shapeUpdateEventSubscriptions[subInfo.shape] || { 1: 1 },
        ).length == 0
      ) {
        delete this.shapeUpdateEventSubscriptions[subInfo.shape];
      }
    }
  }
  passEventToSubscribers(op: shapeUpdateEvent) {
    this.shapeUpdateEventSubscriptions?.["all"]?.["all"]?.forEach((cb) =>
      cb(op),
    );
    if (op.eventType != "addShape") {
      this.shapeUpdateEventSubscriptions?.[op.shapeId]?.["all"]?.forEach((cb) =>
        cb(op),
      );
      this.shapeUpdateEventSubscriptions?.[op.shapeId]?.[op.eventType]?.forEach(
        (cb) => cb(op),
      );
    }
  }
  handleShapeUpdateEvent(op: shapeUpdateEvent, isRevert: boolean = false) {
    switch (op.eventType) {
      case "addShape":
        {
          if (!isRevert)
            this.shapeUpdateEventsInverse[op._id] = {
              _id: crypto.randomUUID(),
              eventType: "deleteShape",
              shapeId: op.shapeId,
            };
          this.shapes[op.payload.shape.shapeId] = op.payload.shape;
        }
        break;

      case "deleteShape":
        {
          if (!isRevert)
            this.shapeUpdateEventsInverse[op._id] = {
              _id: crypto.randomUUID(),
              eventType: "addShape",
              shapeId: op.shapeId,
              payload: { shape: this.shapes[op.shapeId] },
            };
          delete this.shapes[op.shapeId];
        }
        break;
      case "updateEnclosingRectangle":
        {
          if (!isRevert) {
            let [x1, y1, x2, y2] =
              this.shapes[op.shapeId].getEnclosingRectangle();

            this.shapeUpdateEventsInverse[op._id] = {
              _id: crypto.randomUUID(),
              eventType: "updateEnclosingRectangle",
              shapeId: op.shapeId,
              payload: { toUpdate: "updateFull", x1, y1, x2, y2 },
            };
          }
          this.shapes[op.shapeId].applyUpdateEvent(op);
        }
        break;
      case "updateProperty":
        {
          if (!isRevert) {
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
          }

          this.shapes[op.shapeId].applyUpdateEvent(op);
        }
        break;
      default:
        return;
    }

    if (!isRevert) this.shapeUpdateEvents.push(op);

    this.passEventToSubscribers(op);
  }
  destructor() {}

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

  loadRemoteEvents(events: z.infer<typeof shapeUpdateEventZod>[]) {
    // ur responsibility to keep these types the same [maybe shoudl have use zod types everywhere to begin with ] for later maybe
    // and shapemnager is supposed to be all clean rn
    events.forEach((ev) => this.handleShapeUpdateEvent(ev as any));
  }

  revertShapeUpdateEvent(eventId: shapeUpdateEventId) {
    if (!this.shapeUpdateEvents.find((ev) => ev._id == eventId)) return; // callers responsibilty to make sure this doesnt fail

    let len = this.subsribeShapeUpdateEvents.length;
    for (let i = len - 1; i >= 0; i--) {
      let ev = this.shapeUpdateEvents[i];
      //
      this.handleShapeUpdateEvent(this.shapeUpdateEventsInverse[ev._id], true);
      this.shapeUpdateEvents.pop();

      if (ev._id == eventId) break;
    }
  }
}
