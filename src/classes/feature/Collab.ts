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

// you wait for collab to join room before you start tool manager
type collabState = "closed" | "joiningRoom" | "active";
export default class Collab {
  //
  curState: collabState = "closed";
  roomId: string;
  ws: WebSocket;
  shapeManager: ShapeManager;

  addOrDeleteShapeEvents: shapeUpdateEvent[] = [];
  events: shapeUpdateEvent[] = []; // this is not necessary but keeping for ease rn
  perShapeEvents: Record<string, shapeUpdateEvent[]> = {};

  sendMessage(payload: any) {
    this.ws.send(JSON.stringify(payload));
  }

  eventsToIgnore = new Set<shapeUpdateEventId>();

  handleShapeUpdate(event: shapeUpdateEvent) {
    // we dont want seleciton events, so handle that
    let curShape = this.shapeManager.shapes[event.shapeId];
    if (curShape.shapeType == "selection") return;

    if (this.eventsToIgnore.has(event._id)) {
      this.eventsToIgnore.delete(event._id);
      return;
    }

    this.sendMessage({ type: "addEvent", payload: event });
  }

  handleRemoteShapeUpdateEvent(
    event: z.infer<typeof shapeUpdateEventZod>,
    prevEventId: z.infer<typeof shapeUpdateEventIdZod>,
  ) {
    //
    this.eventsToIgnore.add(event._id);
    if (event.eventType == "addShape" || event.eventType == "deleteShape") {
    } else {
    }
    this.shapeManager.handleShapeUpdateEvent(event as any);
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

      case "setCurrentSchema":
        {
          this.shapeManager.loadRemoteEvents(message.payload.events);
        }
        break;

      default:
        break;
    }
  }

  setupEvents() {
    this.events = this.shapeManager.shapeUpdateEvents;
    this.shapeManager.subsribeShapeUpdateEvents(
      "all",
      "all",
      this.handleShapeUpdate.bind(this),
    );
  }

  setupWebSocket() {
    this.ws.onopen = (ev) => {
      this.sendMessage({
        type: "joinRoom",
        payload: {
          roomId: this.roomId,
        },
      });
      this.curState = "joiningRoom";
    };

    this.ws.onmessage = (ev) => {
      const parsedData = JSON.parse(ev.data);
      const { success, data } = webSocketMessageSchema.safeParse(parsedData);
      if (success) this.handleIncomingMessage(data);
      else {
        console.log(" should not get here");
      }
    };

    this.ws.onerror = (ev) => {};
    this.ws.onclose = (ev) => {};
  }

  constructor(shapeManager: ShapeManager, roomId: string) {
    this.roomId = roomId;

    this.shapeManager = shapeManager;
    this.setupEvents();

    this.ws = new WebSocket(import.meta.env.VITE_BACKEND_WEBSOCKET_URL);
    this.setupWebSocket();
  }
  destructor() {
    this.ws.close();
  }
}
