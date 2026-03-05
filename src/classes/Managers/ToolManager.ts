import { useLock, useTool, type Tool } from "../../store/Tools.store.ts";
import RectangleTool from "../Tools/RectangleTool";
import type BaseTool from "../Tools/Tool.ts";
import RotatedRectangleTool from "../Tools/RotatedRectangleTool";
import CircleTool from "../Tools/CircleTool";
import LineTool from "../Tools/LineTool";
import ArrowTool from "../Tools/ArrowTool";
import PenTool from "../Tools/PenTool";
import EraserTool from "../Tools/EraserTool";
import TextTool from "../Tools/TextTool";
import GrabTool from "../Tools/GrabTool.ts";
import CursorTool from "../Tools/CursorTool.ts";
import type ShapeManager from "./ShapeManager";
import type React from "react";
import type { RefObject } from "react";
import type { Tool as ToolType } from "../../store/Tools.store";

type Tools = Record<Tool, BaseTool>;

export type EventType = "taskComplete" | "taskStart";
export default class ToolManager {
  //
  activeTool: Tool;
  lockTool: Boolean;
  tools: Tools;
  canvas: RefObject<HTMLCanvasElement | null>;

  zustandSubscriptions: any[] = [];

  zustandSubsribe() {
    let sub1 = useTool.subscribe(
      (tool) => tool.selectedTool,
      (newTool) => {
        this.activeTool = newTool;
      },
    );
    let sub2 = useLock.subscribe(
      (state) => state.lockTool,
      (newLockState) => {
        this.lockTool = newLockState;
      },
    );
    this.zustandSubscriptions.push(sub1, sub2);
  }

  toolEventsCallback = (toolType: ToolType, eventType: EventType) => {
    if (this.activeTool == toolType) {
      if (eventType == "taskComplete" && !this.lockTool) {
        useTool.setState({ selectedTool: "cursor" });
      }
    }
  };

  constructor(
    shapeManager: ShapeManager,
    canvas: React.RefObject<HTMLCanvasElement | null>,
    editableTextContainer: React.RefObject<HTMLDivElement | null>,
  ) {
    this.activeTool = useTool.getState().selectedTool;
    this.lockTool = useLock.getState().lockTool;

    this.zustandSubsribe();

    this.canvas = canvas;
    this.tools = {
      rect: new RectangleTool(shapeManager, this.toolEventsCallback),
      rotrect: new RotatedRectangleTool(shapeManager, this.toolEventsCallback),
      circle: new CircleTool(shapeManager, this.toolEventsCallback),
      line: new LineTool(shapeManager, this.toolEventsCallback),
      arrow: new ArrowTool(shapeManager, this.toolEventsCallback),
      pen: new PenTool(shapeManager, this.toolEventsCallback),
      eraser: new EraserTool(shapeManager, this.toolEventsCallback),
      text: new TextTool(
        shapeManager,
        editableTextContainer,
        this.toolEventsCallback,
      ),
      cursor: new CursorTool(shapeManager, this.toolEventsCallback),
      grab: new GrabTool(shapeManager, this.toolEventsCallback),
    };
  }

  destructor() {
    Object.values(this.tools).forEach((obj) => obj.destructor());
    this.zustandSubscriptions.forEach((unsub) => unsub());
  }

  onMouseMove(e: MouseEvent) {
    if (e.target == this.canvas.current) {
      this.tools[this.activeTool].onCanvasMouseMove(e);
    } else this.tools[this.activeTool].onOtherMouseMove(e);
  }
  onMouseDown(e: MouseEvent) {
    if (e.target == this.canvas.current) {
      this.tools[this.activeTool].onCanvasMouseDown(e);
    } else this.tools[this.activeTool].onOtherMouseDown(e);
  }
  onMouseUp(e: MouseEvent) {
    if (e.target == this.canvas.current)
      this.tools[this.activeTool].onCanvasMouseUp(e);
    else this.tools[this.activeTool].onOtherMouseUp(e);
  }
}
