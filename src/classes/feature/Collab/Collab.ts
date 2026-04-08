import {
  type shapeUpdateEvent,
  type shapeUpdateEventId,
} from "../../../types/shapeUpdateEvents";
import type ShapeManager from "../../Managers/ShapeManager";
import {
  playerPositionUpdatePayload,
  shapeUpdateEventId as shapeUpdateEventIdZod,
  shapeUpdateEvent as shapeUpdateEventZod,
  webSocketMessageSchema,
} from "../../../types/wsZodSchemas";
import type z from "zod";
import { deserializeShape } from "../../../utils/Deserialization";
import CollabCursorManager from "./CollabCursorManager";
import { getGlobalMouseEvent } from "../../../utils/GlobalMouseEvents";
import type { ShapeType } from "../../Shapes/Shape";
import { useCanvasManager } from "../../../store/CanvasManager.store";

export type collabState = "closed" | "joiningRoom" | "creatingRoom" | "active";
export default class Collab {
  //
  private curState: collabState = "closed";
  private roomId: string | null = null;
  private ws: WebSocket;
  private shapeManager: ShapeManager;

  private addShapeEvents: shapeUpdateEvent[] = [];
  private perShapeEvents: Record<string, shapeUpdateEvent[]> = {};

  private collabCursors = new CollabCursorManager([]);
  sendMessage(payload: any) {
    this.ws.send(JSON.stringify({ roomId: this.roomId, payload }));
    console.log("sending", JSON.stringify({ roomId: this.roomId, payload }));
  }

  private subscriptionsId: string[] = [];
  private eventsToIgnore = new Set<shapeUpdateEventId>();

  private setCurrentState(newState: collabState) {
    this.curState = newState;
    useCanvasManager.setState({ collabState: newState });
  }

  private setRoomId(roomID: string | null) {
    this.roomId = roomID;

    useCanvasManager.setState({
      roomId: roomID,
    });
  }

  handleLocalShapeUpdateEvent(shapeType: ShapeType, event: shapeUpdateEvent) {
    if (this.curState != "active") return;

    if (shapeType == "selection") return;

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
    if (this.curState != "active") return;

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
          this.setCurrentState("active");
          this.setRoomId(message.payload.roomId);
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
          this.destructor();
        }
        break;
      case "clientError":
        {
          this.destructor();
        }
        break;
      case "addEventFailed":
        {
        }
        break;
      case "getCurrentState":
        {
          this.setRoomId(message.payload.roomId);
          this.sendMessage({
            type: "setCurrentState",
            payload: {
              events: this.shapeManager.shapeUpdateEvents
                .filter((tuple) => {
                  return tuple[1] != "selection";
                })
                .map((tuple) => {
                  let ev = tuple[0];
                  if (ev.eventType == "addShape") {
                    return {
                      ...ev,
                      payload: { shape: ev.payload.shape.serialize() },
                    };
                  }
                  return ev;
                }), // here we need to get from local storage or something ,coz shape manager we will keep clean
            },
          });
        }
        break;

      case "setCurrentState":
        {
          // ur responsibility to keep these types the same [maybe shoudl have use zod types everywhere to begin with ] for later maybe
          // and shapemnager is supposed to be all clean rn

          this.handleSetCurrentState(
            message.payload.events,
            message.payload.players,
          );
        }
        break;

      case "playerPositionUpdate":
        {
          this.collabCursors.handlePlayerPositionUpdate(
            message.payload.playerName,
            message.payload.playerPosition,
          );
        }
        break;
      case "playerDisconnected":
        {
          this.collabCursors.handlePlayerDisconnected(
            message.payload.playerName,
          );
        }
        break;
      default:
        {
          this.destructor();
        }
        break;
    }
  }

  handleSetCurrentState(
    events: z.infer<typeof shapeUpdateEventZod>[],
    players: z.infer<typeof playerPositionUpdatePayload>[],
  ) {
    events.forEach((ev) => {
      //

      if (ev.eventType == "addShape") {
        console.log(ev.payload.shape);
        let newShape = deserializeShape(ev.payload.shape);

        this.eventsToIgnore.add(ev._id);
        this.shapeManager.handleShapeUpdateEvent({
          ...ev,
          payload: { shape: newShape! },
        });

        let toSaveEvent = {
          ...ev,
          payload: { shape: newShape! },
        };

        this.eventsToIgnore.add(toSaveEvent._id);
        this.addShapeEvents.push(toSaveEvent);

        this.perShapeEvents[ev.shapeId] = [toSaveEvent];
      } else {
        this.eventsToIgnore.add(ev._id);
        this.shapeManager.handleShapeUpdateEvent(ev as any);

        this.perShapeEvents[ev.shapeId].push(ev as any);
      }
    });

    players.forEach((player) =>
      this.collabCursors.addNewPlayer(player.playerName, player.playerPosition),
    );
  }

  setupSubscriptions() {
    // need to get events from shape manager, but keeping emppty for now
    let subid = this.shapeManager.subsribeShapeUpdateEvents(
      "all",
      "all",
      this.handleLocalShapeUpdateEvent.bind(this),
    );
    this.subscriptionsId.push(subid);
  }

  onWebsocketOpen() {
    if (this.roomId) {
      this.sendMessage({
        type: "joinRoom",
        payload: {
          roomId: this.roomId,
        },
      });
      this.setCurrentState("joiningRoom");
    } else {
      this.sendMessage({ type: "createRoom" });
      this.setCurrentState("creatingRoom");
    }
  }
  onWebsocketMessage(ev: MessageEvent<any>) {
    const parsedData = JSON.parse(ev.data);

    try {
      const data = webSocketMessageSchema.parse(parsedData);
      console.log("recieved", parsedData);

      this.handleIncomingMessage(data);
    } catch (error) {
      // REDZONE - THIS SHOULD NOT HAPPEN , SOMETHING GOT FUCKED UP RELOAD WHOLE STATE
      console.error("REDZONE 4 : wrong request format Zod", error);
      // here we should try to reload state from server
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

  stopCollab() {
    this.destructor();
  }
  constructor(shapeManager: ShapeManager, roomId?: string) {
    if (roomId) this.setRoomId(roomId);

    this.shapeManager = shapeManager;

    this.ws = new WebSocket(import.meta.env.VITE_BACKEND_WEBSOCKET_URL);
    this.setupWebSocket();
    this.setupSubscriptions();
  }

  destructor() {
    this.setCurrentState("closed");
    this.subscriptionsId.forEach((sub) =>
      this.shapeManager.unsubsribeShapeUpdateEvents(sub),
    );
    this.ws.close();
    this.addShapeEvents = [];
    this.perShapeEvents = {};
    this.eventsToIgnore.clear();

    this.collabCursors.destructor();
    this.setRoomId(null);
  }

  draw(ctx: CanvasRenderingContext2D) {
    Object.values(this.collabCursors.players).forEach((shape) =>
      shape.draw(ctx),
    );
  }

  onMouseDown(e: MouseEvent) {}
  onMouseMove(e: MouseEvent) {
    if (this.curState != "active") return;

    const { x, y } = getGlobalMouseEvent(e);

    this.sendMessage({
      type: "playerPositionUpdate",
      payload: {
        playerPosition: {
          x,
          y,
        },
      },
    });
  }
  onMouseUp(e: MouseEvent) {}
}
