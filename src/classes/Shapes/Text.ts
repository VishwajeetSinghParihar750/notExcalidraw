import type { Shape, ShapeType } from "./Shape";

import {
  useToolStyle,
  type opacity,
  type strokeColor,
  type fontFamily,
  type fontSize,
  type textAlign,
} from "../../store/Tools.store";

type TextShapeState = "render" | "edit";
type TextMaxWidth = number | "any";

export class Text implements Shape {
  shapeType: ShapeType = "text";

  // style properties
  strokeColor: strokeColor;
  opacity: opacity;
  fontFamily: fontFamily;
  fontSize: fontSize;
  textAlign: textAlign;

  // shape definition
  curState: TextShapeState;
  text: string[];
  maxWidth: TextMaxWidth = "any";

  constructor(
    curState: TextShapeState,
    text: string[],
    maxWidth?: TextMaxWidth,
  ) {
    let { strokeColor, opacity, textAlign, fontFamily, fontSize } =
      useToolStyle.getState();

    this.curState = curState;
    this.text = text;

    if (maxWidth) this.maxWidth = maxWidth;

    this.strokeColor = strokeColor;
    this.opacity = opacity;
    this.textAlign = textAlign;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
  }

  setStrokeColor(color: strokeColor) {
    this.strokeColor = color;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }
  setCurState(curState: TextShapeState) {
    this.curState = curState;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.curState != "render") return;

    ctx.save();
    //
    {
      switch (this.fontFamily) {
        case "hand":
          ctx.font = "OceanTrace, sans-serif";
          break;

        case "code":
          ctx.font = "Comic Sans MS, sans-serif";
          break;

        case "normal":
          ctx.font = "sans-serif";
          break;

        default:
          break;
      }
      //
      ctx.beginPath();
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    return [1, 2, 3, 4];
  }
  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    return x >= sx && x <= ex && y >= sy && y <= ey;
  }
}
