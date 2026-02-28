import type React from "react";
import type ShapeManager from "../ShapeManager";
import { Point } from "../Shapes/Point";
import { Text } from "../Shapes/Text";

type state = "idle" | "editing";

export default class TextTool {
  shapeManager: ShapeManager;
  curState: state = "idle";

  curText: Text | null = null;
  editableTextContainer: React.RefObject<HTMLDivElement | null>;
  currentInputElement: HTMLInputElement;

  lastMouseDown: Point = new Point(-1e18, -1e18);

  constructor(
    shapeManager: ShapeManager,
    editableTextContainer: React.RefObject<HTMLDivElement | null>,
  ) {
    this.shapeManager = shapeManager;
    this.editableTextContainer = editableTextContainer;

    this.currentInputElement = document.createElement("input");
    this.currentInputElement.onmousedown = (e) => e.stopPropagation();
    this.currentInputElement.onmouseup = (e) => e.stopPropagation();
    this.currentInputElement.onmousemove = (e) => e.stopPropagation();
    this.currentInputElement.id = "textool input element";
  }

  onMouseDown(e: MouseEvent) {
    this.lastMouseDown.x = e.clientX;
    this.lastMouseDown.y = e.clientY;
  }

  onMouseMove(e: MouseEvent) {}
  onMouseUp(e: MouseEvent) {
    if (!this.editableTextContainer.current) return;

    console.log("text up mouseup ");

    let curPoint = new Point(Math.floor(e.clientX), Math.floor(e.clientY));

    if (this.curState == "editing") {
      this.curState = "idle";
      if (this.curText!.text.length == 0) {
        this.shapeManager.removeShape(this.curText!);
      } else {
        this.curText!.curState = "render";
      }
      this.editableTextContainer.current?.removeChild(this.currentInputElement);
    } else if (this.curState == "idle") {
      this.curState = "editing";

      let shapes = this.shapeManager
        .getShapesAt(e.clientX, e.clientY)
        .reverse();
      let lastText = shapes.find((shape) => shape.shapeType == "text");

      if (lastText) this.curText = lastText as Text;
      else this.curText = new Text("edit", []);

      // this.currentInputElement.classList = `absolute w-100 h-100 bg-pink-200 text-blue-400 `;
      this.currentInputElement.style.position = "absolute";
      this.currentInputElement.style.color = "white";
      this.currentInputElement.style.top = `${curPoint.y}px`;
      this.currentInputElement.style.left = `${curPoint.x}px`;
      this.currentInputElement.style.width = "100px";
      this.currentInputElement.style.height = "20px";

      // this.currentInputElement.focus();

      this.editableTextContainer.current?.appendChild(this.currentInputElement);
      // this.currentInputElement.innerText = "this is working fine actually ";

      this.curText.setCurState("edit");
      //
    }
  }
}
