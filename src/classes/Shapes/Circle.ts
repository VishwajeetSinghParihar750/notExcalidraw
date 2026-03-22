import type { Shape, shapeId, ShapeType } from "./Shape";

import {
  useToolStyle,
  type backgroundColor,
  type fillStyle,
  type opacity,
  type strokeColor,
  type strokeStyle,
  type strokeWidth,
} from "../../store/Tools.store";
import type { Point } from "./Point";
import {
  getBackgroundColorString,
  getStrokeColorString,
} from "../../utils/Theme";
import type { shapeUpdateEvent } from "../../types/shapeUpdateEvents";

export class Circle implements Shape {
  readonly shapeType: ShapeType = "circle";
  readonly shapeId: shapeId = crypto.randomUUID();

  private _backgroundColor: backgroundColor;
  private _strokeColor: strokeColor;
  private _strokeWidth: strokeWidth;
  private _strokeStyle: strokeStyle;
  private _opacity: opacity;
  private _fillStyle: fillStyle;

  private _startX: number;
  private _startY: number;
  private _endX: number;
  private _endY: number;

  get backgroundColor() {
    return this._backgroundColor;
  }

  setBackgroundColor(color: backgroundColor) {
    this._backgroundColor = color;
  }

  get strokeColor() {
    return this._strokeColor;
  }

  setStrokeColor(color: strokeColor) {
    this._strokeColor = color;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  setStrokeWidth(width: strokeWidth) {
    this._strokeWidth = width;
  }

  get strokeStyle() {
    return this._strokeStyle;
  }

  setStrokeStyle(style: strokeStyle) {
    this._strokeStyle = style;
  }

  get opacity() {
    return this._opacity;
  }

  setOpacity(opacity: opacity) {
    this._opacity = opacity;
  }

  get fillStyle() {
    return this._fillStyle;
  }

  setFillStyle(style: fillStyle) {
    this._fillStyle = style;
  }

  get startX() {
    return this._startX;
  }

  setStartX(value: number) {
    this._startX = value;
  }

  get startY() {
    return this._startY;
  }

  setStartY(value: number) {
    this._startY = value;
  }

  get endX() {
    return this._endX;
  }

  setEndX(value: number) {
    this._endX = value;
  }

  get endY() {
    return this._endY;
  }

  setEndY(value: number) {
    this._endY = value;
  }

  clone() {
    let circle = new Circle(this._startX, this._startY, this._endX, this._endY);
    circle.setBackgroundColor(this._backgroundColor);
    circle.setFillStyle(this._fillStyle);
    circle.setOpacity(this._opacity);
    circle.setStrokeColor(this._strokeColor);
    circle.setStrokeWidth(this._strokeWidth);
    circle.setStrokeStyle(this._strokeStyle);
    return circle;
  }

  constructor(startX: number, startY: number, endX: number, endY: number) {
    console.log("callled circle constructor ");
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;

    let {
      backgroundColor,
      strokeColor,
      strokeWidth,
      strokeStyle,
      opacity,
      fillStyle,
    } = useToolStyle.getState();

    this._backgroundColor = backgroundColor;
    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._strokeStyle = strokeStyle;
    this._opacity = opacity;
    this._fillStyle = fillStyle;
  }

  update(startX: number, startY: number, endX: number, endY: number) {
    this._startX = startX;
    this._startY = startY;
    this._endX = endX;
    this._endY = endY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let [x1, y1, x2, y2] = this.getEnclosingRectangle();

    let cx = (x1 + x2) / 2;
    let cy = (y1 + y2) / 2;
    let rx = (x2 - x1) / 2;
    let ry = (y2 - y1) / 2;

    ctx.save();

    ctx.globalAlpha = this._opacity / 100.0;

    {
      ctx.save();

      ctx.lineWidth = this._strokeWidth;
      ctx.strokeStyle = getStrokeColorString(this._strokeColor);

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

      if (this._strokeStyle == "smalldotted") {
        ctx.setLineDash([4, 8]);
      } else if (this._strokeStyle == "dotted") ctx.setLineDash([8, 16]);

      ctx.stroke();

      ctx.restore();
    }

    let bgColor = getBackgroundColorString(this._backgroundColor);

    if (bgColor != "none") {
      ctx.save();

      if (this._fillStyle == "fill") {
        ctx.fillStyle = bgColor;
        ctx.fill();
      } else if (this._fillStyle == "line") {
        ctx.clip();
        ctx.lineWidth = 1;
        ctx.strokeStyle = bgColor;

        let d = Math.ceil(
          Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
        );
        ctx.beginPath();

        let gap = this._strokeWidth * 5;
        for (let pos = gap; pos < d * 2; pos += gap) {
          ctx.moveTo(x1 + pos, y1);
          ctx.lineTo(x1, y1 + pos);
        }
        ctx.stroke();
      } else if (this._fillStyle == "crosslines") {
        ctx.clip();
        ctx.lineWidth = 1;
        ctx.strokeStyle = bgColor;

        let d = Math.ceil(
          Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
        );
        ctx.beginPath();

        let gap = this._strokeWidth * 5;
        for (let pos = gap; pos < d * 2; pos += gap) {
          ctx.moveTo(x1 + pos, y1);
          ctx.lineTo(x1, y1 + pos);
        }
        for (let pos = gap; pos < d * 2; pos += gap) {
          ctx.moveTo(x2, y1 + pos);
          ctx.lineTo(x2 - pos, y1);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    this._startX += delX;
    this._endX += delX;
    this._startY += delY;
    this._endY += delY;
  }

  updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {
    this._startX = x1;
    this._startY = y1;
    this._endX = x2;
    this._endY = y2;
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = Math.min(this._startX, this._endX);
    let x2 = Math.max(this._startX, this._endX);
    let y1 = Math.min(this._startY, this._endY);
    let y2 = Math.max(this._startY, this._endY);
    return [x1, y1, x2, y2];
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
  propertySetters = {
    backgroundColor: this.setBackgroundColor.bind(this),
    strokeColor: this.setStrokeColor.bind(this),
    strokeWidth: this.setStrokeWidth.bind(this),
    strokeStyle: this.setStrokeStyle.bind(this),
    opacity: this.setOpacity.bind(this),
    fillStyle: this.setFillStyle.bind(this),
  };

  applyUpdateEvent(shapeUpdateEvent: shapeUpdateEvent) {
    //
    switch (shapeUpdateEvent.eventType) {
      case "updateProperty":
        {
          Object.entries(shapeUpdateEvent.payload).forEach(([key, val]) => {
            let typedProp = key as keyof typeof this.propertySetters;
            let typedFn = this.propertySetters[typedProp] as (val: any) => void;
            typedFn?.(val);
          });
        }
        break;
      case "updateEnclosingRectangle":
        {
          switch (shapeUpdateEvent.payload.toUpdate) {
            case "updateFull":
              {
                let { x1, y1, x2, y2 } = shapeUpdateEvent.payload;
                this.updateEnclosingRectangle(x1!, y1!, x2!, y2!);
              }
              break;
            case "moveFull":
              {
                this.moveEnclosingRectangle(
                  shapeUpdateEvent.payload.delX!,
                  shapeUpdateEvent.payload.delY!,
                );
              }
              break;
            default:
              break;
          }
        }
        break;

      default:
        break;
    }
  }
}
