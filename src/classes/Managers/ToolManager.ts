import { useTool, type Tool } from "../../store/Tools.store.ts";
import RectangleTool from "../Tools/RectangleTool";
import RotatedRectangleTool from "../Tools/RotatedRectangleTool";
import CircleTool from "../Tools/CircleTool";
import LineTool from "../Tools/LineTool";
import ArrowTool from "../Tools/ArrowTool";
import PenTool from "../Tools/PenTool";
import EraserTool from "../Tools/EraserTool";
import TextTool from "../Tools/TextTool";
import type ShapeManager from "./ShapeManager";
import type React from "react";

type Tools = {
  rect: RectangleTool;
  rotrect: RotatedRectangleTool;
  circle: CircleTool;
  line: LineTool;
  arrow: ArrowTool;
  pen: PenTool;
  eraser: EraserTool;
  text: TextTool;
};

export default class ToolMangager {
  //
  activeTool: Tool;
  tools: Tools;

  zustandUnsubscribe: any;

  zustandSubsribe() {
    this.zustandUnsubscribe = useTool.subscribe(
      (tool) => tool.selectedTool,
      (newTool) => {
        this.activeTool = newTool;
        console.log(this.activeTool);
      },
    );
  }

  constructor(
    shapeManager: ShapeManager,
    canvas: React.RefObject<HTMLCanvasElement | null>,
    editableTextContainer: React.RefObject<HTMLDivElement | null>,
  ) {
    this.activeTool = useTool.getState().selectedTool;
    this.zustandSubsribe();

    this.tools = {
      rect: new RectangleTool(shapeManager),
      rotrect: new RotatedRectangleTool(shapeManager),
      circle: new CircleTool(shapeManager),
      line: new LineTool(shapeManager),
      arrow: new ArrowTool(shapeManager),
      pen: new PenTool(shapeManager),
      eraser: new EraserTool(shapeManager),
      text: new TextTool(shapeManager, editableTextContainer, canvas),
    };
  }
  destructor() {
    Object.values(this.tools).forEach((obj) => obj.destructor());
    if (this.zustandUnsubscribe) this.zustandUnsubscribe();
  }

  onMouseMove(e: MouseEvent) {
    console.log(this.activeTool);
    switch (this.activeTool) {
      case "rect":
        this.tools.rect.onMouseMove(e);
        break;
      case "rotrect":
        this.tools.rotrect.onMouseMove(e);
        break;
      case "circle":
        this.tools.circle.onMouseMove(e);
        break;
      case "line":
        this.tools.line.onMouseMove(e);
        break;
      case "arrow":
        this.tools.arrow.onMouseMove(e);
        break;
      case "pen":
        this.tools.pen.onMouseMove(e);
        break;
      case "eraser":
        this.tools.eraser.onMouseMove(e);
        break;
      case "text":
        this.tools.text.onMouseMove(e);
        break;

      default:
        break;
    }
  }
  onMouseDown(e: MouseEvent) {
    switch (this.activeTool) {
      case "rect":
        this.tools.rect.onMouseDown(e);
        break;
      case "rotrect":
        this.tools.rotrect.onMouseDown(e);
        break;
      case "circle":
        this.tools.circle.onMouseDown(e);
        break;
      case "line":
        this.tools.line.onMouseDown(e);
        break;
      case "arrow":
        this.tools.arrow.onMouseDown(e);
        break;
      case "pen":
        this.tools.pen.onMouseDown(e);
        break;
      case "eraser":
        this.tools.eraser.onMouseDown(e);
        break;
      case "text":
        this.tools.text.onMouseDown(e);
        break;
      default:
        break;
    }
  }
  onMouseUp(e: MouseEvent) {
    // console.log("window up");
    switch (this.activeTool) {
      case "rect":
        this.tools.rect.onMouseUp(e);
        break;
      case "rotrect":
        this.tools.rotrect.onMouseUp(e);
        break;
      case "circle":
        this.tools.circle.onMouseUp(e);
        break;
      case "line":
        this.tools.line.onMouseUp(e);
        break;
      case "arrow":
        this.tools.arrow.onMouseUp(e);
        break;
      case "pen":
        this.tools.pen.onMouseUp(e);
        break;
      case "eraser":
        this.tools.eraser.onMouseUp(e);
        break;
      case "text":
        this.tools.text.onMouseUp(e);
        break;

      default:
        break;
    }
  }
}
