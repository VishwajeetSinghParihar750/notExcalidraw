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
    let curShape = this.shapeManager.shapes[event.shapeId];
    console.log(event);

    if (curShape?.shapeType == "selection") return;

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

  handleRemoteShapeUpdateEvent(
    event: z.infer<typeof shapeUpdateEventZod>,
    prevEventId: z.infer<typeof shapeUpdateEventIdZod> | null,
  ) {
    //
    if (this.curState != "active") return; // this should not happen

    console.log(this.addShapeEvents, this.perShapeEvents);
    console.log(event);

    if (event.eventType == "addShape") {
      let prevEventIndex =
        prevEventId == null
          ? undefined
          : this.addShapeEvents.findLastIndex((ev) => ev._id == prevEventId);

      if (
        (prevEventId != null && prevEventIndex == undefined) ||
        (prevEventIndex != undefined &&
          prevEventIndex + 1 > this.addShapeEvents.length)
      ) {
        // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP RELOAD WHOLE STATE
        console.log("REDZONE 1");
      } else {
        if (
          prevEventIndex != undefined &&
          this.addShapeEvents[prevEventIndex + 1]._id == event._id
        ) {
          // done its ur local thing
          return;
        }

        let newShape = deserializeShape(event.payload.shape);
        if (newShape == undefined) {
          // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP
          console.log("REDZONE 2");
          return;
        }

        while (
          this.addShapeEvents.length > 0 &&
          this.addShapeEvents[this.addShapeEvents.length - 1]._id != prevEventId
        ) {
          let curLastEvent = this.addShapeEvents.pop();

          while (this.perShapeEvents[curLastEvent!.shapeId].length > 0) {
            let curShapeLastEvent =
              this.perShapeEvents[curLastEvent!.shapeId].pop();

            let revertEvent =
              this.shapeManager.shapeUpdateEventsInverse[
                curShapeLastEvent!._id
              ];

            this.eventsToIgnore.add(revertEvent._id);
            this.shapeManager.handleShapeUpdateEvent(revertEvent);
          }
        }

        this.eventsToIgnore.add(event._id);
        this.shapeManager.handleShapeUpdateEvent({
          ...event,
          payload: { shape: newShape },
        });

        let toSaveEvent = {
          ...event,
          payload: { shape: newShape },
        };
        this.addShapeEvents.push(toSaveEvent);

        this.perShapeEvents[event.shapeId] = [toSaveEvent];
      }
    } else {
      //
      let prevEventIndex = this.perShapeEvents[event.shapeId].findLastIndex(
        (ev) => ev._id == prevEventId,
      );

      if (
        prevEventIndex == undefined ||
        (prevEventIndex != undefined &&
          prevEventIndex + 1 > this.perShapeEvents[event.shapeId].length)
      ) {
        // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP RELOAD WHOLE STATE
        console.log("REDZONE 3");
      } else {
        //
        if (
          this.perShapeEvents[event.shapeId][prevEventIndex + 1]._id ==
          event._id
        ) {
          // done its ur local thing
          return;
        }

        while (prevEventIndex + 1 < this.perShapeEvents[event.shapeId].length) {
          let curLastEvent = this.perShapeEvents[event.shapeId].pop();
          let revertEvent =
            this.shapeManager.shapeUpdateEventsInverse[curLastEvent!._id];

          this.eventsToIgnore.add(revertEvent._id);
          this.shapeManager.handleShapeUpdateEvent(revertEvent);
        }

        this.shapeManager.handleShapeUpdateEvent(event as any);
      }
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
      this.handleRemoteShapeUpdateEvent(
        ev,
        ind == 0 ? null : events[ind - 1]._id,
      );
    });
  }

  setupEvents() {
    // need to get events from shape manager, but keeping emppty for now
    this.shapeManager.subsribeShapeUpdateEvents(
      "all",
      "all",
      this.handleLocalShapeUpdateEvent.bind(this),
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
      console.log("received", parsedData);

      try {
        const data = webSocketMessageSchema.parse(parsedData);
        this.handleIncomingMessage(data);
      } catch (error) {
        // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP RELOAD WHOLE STATE
        console.log("REDZONE 4", error);
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
