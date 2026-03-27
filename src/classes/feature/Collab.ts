import {
  type shapeUpdateEvent,
  type shapeUpdateEventId,
} from "../../types/shapeUpdateEvents";
import type ShapeManager from "../Managers/ShapeManager";
import {
  shapeUpdateEventId as shapeUpdateEventIdZod,
  shapeUpdateEvent as shapeUpdateEventZod,
  webSocketMessageSchema,
} from "../../types/wsZodSchemas";
import type z from "zod";
import { deserializeShape } from "../../utils/Deserialization";

// you wait for collab to join room before you start tool manager
// need some form of global management , whihc doesnt exist rn

type collabState = "closed" | "joiningRoom" | "active";
export default class Collab {
  //
  curState: collabState = "closed";
  roomId: string;
  ws: WebSocket;
  shapeManager: ShapeManager;

  addShapeEvents: shapeUpdateEvent[] = [];
  perShapeEvents: Record<string, shapeUpdateEvent[]> = {};

  sendMessage(payload: any) {
    this.ws.send(JSON.stringify({ roomId: this.roomId, payload }));
    console.log("sending", payload);
  }

  eventsToIgnore = new Set<shapeUpdateEventId>();

  handleLocalShapeUpdateEvent(event: shapeUpdateEvent) {
    // we dont want seleciton events, so handle that

    if (this.eventsToIgnore.has(event._id)) {
      this.eventsToIgnore.delete(event._id);
      return;
    }

    if (event.eventType == "addShape") {
      this.addShapeEvents.push(event);
      this.perShapeEvents[event.shapeId] = [];
    }

    this.perShapeEvents[event.shapeId].push(event);

    if (event.eventType == "addShape") {
      this.sendMessage({
        type: "addEvent",
        payload: {
          ...event,
          payload: { shape: event.payload.shape.serialize() },
        },
      });
    } else this.sendMessage({ type: "addEvent", payload: event });
  }

  isEventLocalAndOrdered(
    prevEventId: z.infer<typeof shapeUpdateEventIdZod> | null,
    event: z.infer<typeof shapeUpdateEventZod>,
  ): boolean {
    if (!this.perShapeEvents[event.shapeId]) return false;

    if (event.eventType == "addShape") {
      //
      let curEventIndex = this.addShapeEvents.findLastIndex(
        (ev) => ev._id == event._id,
      );

      return (
        (curEventIndex == 0 && prevEventId == null) ||
        (curEventIndex > 0 &&
          this.addShapeEvents[curEventIndex - 1]._id == prevEventId)
      );
    } else {
      let curEventIndex = this.perShapeEvents[event.shapeId].findLastIndex(
        (ev) => ev._id == event._id,
      );
      return !(
        curEventIndex < 1 ||
        this.perShapeEvents[event.shapeId][curEventIndex - 1]._id != prevEventId
      );
    }
  }
  revertNecessaryEvents(
    prevEventId: z.infer<typeof shapeUpdateEventIdZod> | null,
    event: z.infer<typeof shapeUpdateEventZod>,
  ) {
    if (event.eventType == "addShape") {
      let len = this.addShapeEvents.length;
      for (let i = len - 1; i >= 0; i--) {
        if (this.addShapeEvents[i]._id == prevEventId) break;

        let curshapeEvents = this.perShapeEvents[this.addShapeEvents[i]._id];
        while (curshapeEvents.length > 0) {
          let lastEvent = curshapeEvents.pop();
          let inverseEvent =
            this.shapeManager.shapeUpdateEventsInverse[lastEvent!._id];

          this.eventsToIgnore.add(inverseEvent._id);
          this.shapeManager.handleShapeUpdateEvent(inverseEvent);
        }

        this.addShapeEvents.pop();
      }
    } else {
      let curshapeEvents = this.perShapeEvents[event.shapeId];
      for (let i = curshapeEvents.length - 1; i >= 0; i--) {
        if (curshapeEvents[i]._id == prevEventId) break;

        let lastEvent = curshapeEvents.pop();
        let inverseEvent =
          this.shapeManager.shapeUpdateEventsInverse[lastEvent!._id];

        this.eventsToIgnore.add(inverseEvent._id);
        this.shapeManager.handleShapeUpdateEvent(inverseEvent);
      }
    }
  }

  handleRemoteShapeUpdateEvent(
    event: z.infer<typeof shapeUpdateEventZod>,
    prevEventId: z.infer<typeof shapeUpdateEventIdZod> | null,
  ) {
    if (this.isEventLocalAndOrdered(prevEventId, event)) return;

    this.revertNecessaryEvents(prevEventId, event);

    if (event.eventType == "addShape") {
      console.log(event.payload.shape);
      let newShape = deserializeShape(event.payload.shape);

      this.eventsToIgnore.add(event._id);
      this.shapeManager.handleShapeUpdateEvent({
        ...event,
        payload: { shape: newShape! },
      });

      let toSaveEvent = {
        ...event,
        payload: { shape: newShape! },
      };

      this.eventsToIgnore.add(toSaveEvent._id);
      this.addShapeEvents.push(toSaveEvent);

      this.perShapeEvents[event.shapeId] = [toSaveEvent];
    } else {
      this.eventsToIgnore.add(event._id);
      this.shapeManager.handleShapeUpdateEvent(event as any);

      this.perShapeEvents[event.shapeId].push(event as any);
    }
  }

  handleIncomingMessage(message: z.infer<typeof webSocketMessageSchema>) {
    switch (message.type) {
      case "roomJoined":
        {
          this.curState = "active";
        }
        break;
      case "eventAdded":
        {
          this.handleRemoteShapeUpdateEvent(
            message.payload.addedEvent,
            message.payload.prevEventId,
          );
        }
        break;
      case "serverError":
        {
        }
        break;
      case "clientError":
        {
        }
        break;
      case "addEventFailed":
        {
        }
        break;
      case "getCurrentState":
        {
          this.sendMessage({
            type: "setCurrentState",
            payload: {
              events: [], // here we need to get from local storage or something ,coz shape manager we will keep clean
            },
          });
        }
        break;

      case "setCurrentState":
        {
          // ur responsibility to keep these types the same [maybe shoudl have use zod types everywhere to begin with ] for later maybe
          // and shapemnager is supposed to be all clean rn

          this.handleSetCurrentState(message.payload.events);
        }
        break;

      default:
        break;
    }
  }

  handleSetCurrentState(events: z.infer<typeof shapeUpdateEventZod>[]) {
    events.forEach((ev, ind) => {
      //

      if (ev.eventType == "addShape") {
        let curEvent = ev;
        let newShape = deserializeShape(curEvent.payload.shape);
        if (newShape) {
          curEvent = {
            ...curEvent,
            payload: { shape: newShape as any },
          };

          this.addShapeEvents.push(curEvent as any);
          this.perShapeEvents[ev.shapeId] = [curEvent as any];

          this.eventsToIgnore.add(ev._id);
          this.shapeManager.handleShapeUpdateEvent(curEvent as any);
        } else console.error("deserializeShape gives undefined");
      } else {
        this.perShapeEvents[ev.shapeId].push(ev as any);
        this.eventsToIgnore.add(ev._id);
        this.shapeManager.handleShapeUpdateEvent(ev as any);
      }
    });
  }

  setupSubscriptions() {
    // need to get events from shape manager, but keeping emppty for now
    this.shapeManager.subsribeShapeUpdateEvents(
      "all",
      "all",
      this.handleLocalShapeUpdateEvent.bind(this),
    );
  }

  onWebsocketOpen() {
    this.sendMessage({
      type: "joinRoom",
      payload: {
        roomId: this.roomId,
      },
    });
    this.curState = "joiningRoom";
  }
  onWebsocketMessage(ev: MessageEvent<any>) {
    const parsedData = JSON.parse(ev.data);

    try {
      const data = webSocketMessageSchema.parse(parsedData);

      this.handleIncomingMessage(data);
    } catch (error) {
      // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP RELOAD WHOLE STATE
      console.error("REDZONE 4 : wrong request format Zod", error);
    }
  }

  setupWebSocket() {
    this.ws.onopen = (ev) => {
      this.onWebsocketOpen();
    };

    this.ws.onmessage = (ev) => {
      this.onWebsocketMessage(ev);
    };

    this.ws.onerror = (ev) => {};
    this.ws.onclose = (ev) => {};
  }

  constructor(shapeManager: ShapeManager, roomId: string) {
    this.roomId = roomId;

    this.shapeManager = shapeManager;
    this.setupSubscriptions();

    this.ws = new WebSocket(import.meta.env.VITE_BACKEND_WEBSOCKET_URL);
    this.setupWebSocket();
  }
  destructor() {
    this.ws.close();
  }
}
