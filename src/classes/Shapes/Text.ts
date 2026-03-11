import type { Shape, ShapeType } from "./Shape";

import {
  useToolStyle,
  type opacity,
  type strokeColor,
  type fontFamily,
  type fontSize,
} from "../../store/Tools.store";
import { Point } from "./Point";

type TextShapeState = "render" | "edit";
type TextMaxWidth = number | "any";

export class Text implements Shape {
  shapeType: ShapeType = "text";

  // style properties
  strokeColor: strokeColor;
  opacity: opacity;
  fontFamily: fontFamily;
  fontSize: fontSize;

  // shape definition
  curState: TextShapeState;
  text: string;
  maxWidth: TextMaxWidth = "any";
  startPoint: Point;

  //
  enclosingRectangle: [Point, Point];

  constructor(
    curState: TextShapeState,
    text: string,
    enclosingRectangle: [Point, Point],
    maxWidth?: TextMaxWidth,
  ) {
    let { strokeColor, opacity, fontFamily, fontSize } =
      useToolStyle.getState();

    this.enclosingRectangle = enclosingRectangle;

    this.curState = curState;
    this.text = text;
    this.startPoint = enclosingRectangle[0];

    if (maxWidth) this.maxWidth = maxWidth;

    this.strokeColor = strokeColor;
    this.opacity = opacity;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
  }

  setStrokeColor(color: strokeColor) {
    this.strokeColor = color;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }
  setFontFamily(fontFamily: fontFamily) {
    this.fontFamily = fontFamily;
  }
  setFontSize(fontSize: fontSize) {
    this.fontSize = fontSize;
  }

  setCurState(curState: TextShapeState) {
    this.curState = curState;
  }
  setEnclosingRectangleCoordinates(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    this.enclosingRectangle[0].x = x1;
    this.enclosingRectangle[1].x = x2;
    this.enclosingRectangle[0].y = y1;
    this.enclosingRectangle[1].y = y2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.curState != "render") return;

    ctx.save();
    //
    {
      ctx.globalAlpha = this.opacity / 100;

      let lineHeight = 0;
      let pixelFontSize = 10;
      switch (this.fontSize) {
        case "small":
          pixelFontSize = 16;
          break;
        case "medium":
          pixelFontSize = 24;
          break;
        case "large":
          pixelFontSize = 32;
          break;
        case "extra-large":
          pixelFontSize = 40;
          break;

        default:
          pixelFontSize = this.fontSize;
          break;
      }
      lineHeight = pixelFontSize * 1.2;

      switch (this.fontFamily) {
        case "hand":
          ctx.font = `${pixelFontSize}px Handwriting`;
          break;

        case "code":
          ctx.font = `${pixelFontSize}px Code`;
          break;

        case "normal":
          ctx.font = `${pixelFontSize}px sans-serif`;
          break;

        default:
          break;
      }
      //
      ctx.beginPath();
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const lines = this.text.split("\n");
      ctx.fillStyle = this.strokeColor;

      lines.forEach((line, ind) => {
        ctx.fillText(
          line,
          this.startPoint.x,
          this.startPoint.y + ind * lineHeight,
        );
      });
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    return [
      this.enclosingRectangle[0].x,
      this.enclosingRectangle[0].y,
      this.enclosingRectangle[1].x,
      this.enclosingRectangle[1].y,
    ];
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    //
    this.enclosingRectangle[0].x += delX;
    this.enclosingRectangle[1].x += delX;
    this.enclosingRectangle[0].y += delY;
    this.enclosingRectangle[1].y += delY;
  }

  // i will be scaling this only on all size chages from selection, no other updates
  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    const lines = this.text.split("\n").length;
    let lineHeight = (ney - nsy) / lines;
    let fontsizevalue = lineHeight / 1.2;

    this.setFontSize(fontsizevalue);
    this.setEnclosingRectangleCoordinates(nsx, nsy, nex, ney);
  }

  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    return x >= sx && x <= ex && y >= sy && y <= ey;
  }
  liesInside(point1: Point, point2: Point) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    let minx = Math.min(point1.x, point2.x);
    let miny = Math.min(point1.y, point2.y);
    let maxx = Math.max(point1.x, point2.x);
    let maxy = Math.max(point1.y, point2.y);

    return sx >= minx && ex <= maxx && sy >= miny && ey <= maxy;
  }
}
