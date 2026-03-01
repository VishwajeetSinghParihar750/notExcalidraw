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
  currentInputElement: HTMLTextAreaElement;

  lastMouseDown: Point = new Point(-1e18, -1e18);

  constructor(
    shapeManager: ShapeManager,
    editableTextContainer: React.RefObject<HTMLDivElement | null>,
  ) {
    this.shapeManager = shapeManager;
    this.editableTextContainer = editableTextContainer;

    this.currentInputElement = document.createElement("textarea");
    this.currentInputElement.onmousedown = (e) => e.stopPropagation();
    this.currentInputElement.onmouseup = (e) => e.stopPropagation();
    this.currentInputElement.onmousemove = (e) => e.stopPropagation();

    this.currentInputElement.id = "textool input element";

    this.currentInputElement.style.whiteSpace = "pre";
    this.currentInputElement.style.resize = "none";
    this.currentInputElement.style.overflow = "hidden";
    this.currentInputElement.style.outline = "none";

    this.currentInputElement.addEventListener("input", (e) => {
      this.currentInputElement.style.height = "auto";
      this.currentInputElement.style.height =
        this.currentInputElement.scrollHeight + "px";
      this.currentInputElement.style.width = "auto";
      this.currentInputElement.style.width =
        this.currentInputElement.scrollWidth + "px";
    });
  }

  onMouseDown(e: MouseEvent) {
    if (this.curState == "idle") this.curState = "editing";
    else if (this.curState == "editing") {
      this.curState = "idle";

      let rect = this.currentInputElement.getBoundingClientRect();
      this.curText!.setEnclosingRectangleCoordinates([
        rect.x,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.height,
      ]);

      this.curText!.text = this.currentInputElement.value;
      this.curText!.curState = "render";
      this.currentInputElement.value = "";

      if (this.curText!.text.length == 0)
        this.shapeManager.removeShape(this.curText!);

      this.editableTextContainer.current?.removeChild(this.currentInputElement);
    }

    this.lastMouseDown.x = e.clientX;
    this.lastMouseDown.y = e.clientY;
  }

  onMouseMove(e: MouseEvent) {}

  onMouseUp(e: MouseEvent) {
    if (!this.editableTextContainer.current) return;

    if (this.curState == "editing") {
      const containerRect =
        this.editableTextContainer.current!.getBoundingClientRect();

      let curPoint = new Point(
        Math.floor(e.clientX - containerRect.left),
        Math.floor(e.clientY - containerRect.top),
      );
      // let curPoint = new Point(Math.floor(e.clientX), Math.floor(e.clientY));

      let shapes = this.shapeManager
        .getShapesAt(curPoint.x, curPoint.y)
        .reverse();

      let lastText = shapes.find((shape) => shape.shapeType == "text");

      if (lastText) {
        this.curText = lastText as Text;
      } else {
        this.curText = new Text("edit", "", [
          new Point(curPoint.x, curPoint.y),
          new Point(curPoint.x, curPoint.y),
        ]);
        this.shapeManager.addShape(this.curText);
      }

      this.currentInputElement.value = this.curText.text;

      this.currentInputElement.style.position = "absolute";
      this.currentInputElement.style.top = `${this.curText.startPoint.y}px`;
      this.currentInputElement.style.left = `${this.curText.startPoint.x}px`;

      this.currentInputElement.style.color = this.curText.strokeColor;
      this.currentInputElement.style.opacity = (
        this.curText.opacity / 100
      ).toString();

      switch (this.curText.fontSize) {
        case "small":
          this.currentInputElement.style.fontSize = "16px";
          this.currentInputElement.style.lineHeight = "20px";
          break;
        case "medium":
          this.currentInputElement.style.fontSize = "24px";
          this.currentInputElement.style.lineHeight = "30px";
          break;
        case "large":
          this.currentInputElement.style.fontSize = "32px";
          this.currentInputElement.style.lineHeight = "38px";
          break;
        case "extra-large":
          this.currentInputElement.style.fontSize = "40px";
          this.currentInputElement.style.lineHeight = "48px";
          break;

        default:
          break;
      }
      switch (this.curText.fontFamily) {
        case "code":
          this.currentInputElement.style.fontFamily = "Code";
          break;
        case "normal":
          this.currentInputElement.style.fontFamily = "sans-serif";
          break;
        case "hand":
          this.currentInputElement.style.fontFamily = "Handwriting";
          break;

        default:
          break;
      }

      this.editableTextContainer.current?.appendChild(this.currentInputElement);

      this.currentInputElement.style.height = "auto";
      this.currentInputElement.style.height =
        this.currentInputElement.scrollHeight + "px";
      this.currentInputElement.style.width = "auto";
      this.currentInputElement.style.width =
        this.currentInputElement.scrollWidth + "px";

      this.curText.setCurState("edit");

      this.currentInputElement.select();
    }
  }
}
