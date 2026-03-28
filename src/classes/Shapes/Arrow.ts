import type { Shape, shapeId, ShapeType } from "./Shape";
import { isSamePoint } from "./Point";
import type { Point } from "./Point";

import {
  useGrabToolPosition,
  useToolStyle,
  type arrowType,
  type opacity,
  type strokeColor,
  type strokeStyle,
  type strokeWidth,
} from "../../store/Tools.store";
import { catmullRomToBezier } from "../../utils/Line";
import { getStrokeColorString } from "../../utils/Theme";
import type { shapeUpdateEvent } from "../../types/shapeUpdateEvents";

export class Arrow implements Shape {
  readonly shapeType: ShapeType = "arrow";
  readonly shapeId: shapeId;

  private _strokeColor: strokeColor;
  private _strokeWidth: strokeWidth;
  private _strokeStyle: strokeStyle;
  private _opacity: opacity;
  private _arrowType: arrowType;

  private _points: Point[];

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

  get arrowType() {
    return this._arrowType;
  }

  setArrowType(arrowType: arrowType) {
    this._arrowType = arrowType;
  }

  get points() {
    return this._points;
  }

  setPoints(points: Point[]) {
    this._points = points;
  }

  clone() {
    let line = new Arrow(structuredClone(this._points));
    line.setArrowType(this._arrowType);
    line.setOpacity(this._opacity);
    line.setStrokeColor(this._strokeColor);
    line.setStrokeWidth(this._strokeWidth);
    line.setStrokeStyle(this._strokeStyle);
    return line;
  }

  constructor(points: Point[], shapeId: shapeId = crypto.randomUUID()) {
    this._points = points;
    this.shapeId = shapeId;

    let { strokeColor, strokeWidth, strokeStyle, opacity, arrowType } =
      useToolStyle.getState();

    this._strokeColor = strokeColor;
    this._strokeWidth = strokeWidth;
    this._strokeStyle = strokeStyle;
    this._opacity = opacity;
    this._arrowType = arrowType;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { x: offsetX, y: offsetY } = useGrabToolPosition.getState();

    if (
      this._points.length < 2 ||
      (this._points.length == 2 &&
        isSamePoint(this._points[0], this._points[1]))
    )
      return;

    ctx.save();
    ctx.transform(1, 0, 0, 1, offsetX, offsetY);

    ctx.globalAlpha = this._opacity / 100;

    ctx.save();

    ctx.strokeStyle = getStrokeColorString(this._strokeColor);
    ctx.lineWidth = this._strokeWidth;

    ctx.save();

    if (this._strokeStyle == "smalldotted") ctx.setLineDash([4, 8]);
    else if (this._strokeStyle == "dotted") ctx.setLineDash([8, 16]);

    ctx.beginPath();

    if (this._arrowType == "straight") {
      ctx.moveTo(this._points[0].x, this._points[0].y);
      let len = this._points.length;

      for (let i = 1; i < len; i++) {
        ctx.lineTo(this._points[i].x, this._points[i].y);
      }
    } else if (this._arrowType == "curve") {
      ctx.moveTo(this._points[0].x, this._points[0].y);

      let points = [
        this._points[0],
        ...this._points,
        this._points[this._points.length - 1],
      ];

      for (let i = 1; i < points.length - 2; i++) {
        let p0 = points[i - 1];
        let p1 = points[i];
        let p2 = points[i + 1];
        let p3 = points[i + 2];

        let [_, b1, b2, b3] = catmullRomToBezier(p0, p1, p2, p3);
        ctx.bezierCurveTo(
          b1.x,
          b1.y,
          b2.x,
          b2.y,
          b3.x,
          b3.y,
        );
      }
    } else if (this._arrowType == "snake") {
      let a = this._points[0];
      ctx.moveTo(a.x, a.y);

      for (let i = 0; i < this._points.length - 2; i++) {
        let b = this._points[i + 1];
        let c = this._points[i + 2];

        let check = Math.floor(
          Math.min(Math.abs(a.x - c.x), Math.abs(a.y - c.y)),
        );

        ctx.arcTo(
          b.x,
          b.y,
          c.x,
          c.y,
          check < 20 ? 0 : 10,
        );
      }

      let len = this._points.length;
      ctx.lineTo(
        this._points[len - 1].x,
        this._points[len - 1].y,
      );
    }

    ctx.stroke();
    ctx.restore();

    let len = this._points.length;
    let a = this._points[len - 2];
    let b = this._points[len - 1];

    let opposite = b.x < a.x ? -1 : 1;

    let theta = Math.atan((b.y - a.y) / (b.x - a.x));
    let alpha = theta - Math.PI / 6;
    let beta = theta + Math.PI / 6;

    let dis = 20 * opposite;

    let dx1 = dis * Math.cos(alpha);
    let dy1 = dis * Math.sin(alpha);
    let dx2 = dis * Math.cos(beta);
    let dy2 = dis * Math.sin(beta);

    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - dx1, b.y - dy1);
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - dx2, b.y - dy2);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;

    for (let point of this._points) {
      x1 = Math.min(x1, point.x);
      x2 = Math.max(x2, point.x);
      y1 = Math.min(y1, point.y);
      y2 = Math.max(y2, point.y);
    }

    return [x1, y1, x2, y2];
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    for (let point of this._points) {
      point.x += delX;
      point.y += delY;
    }
  }

  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    this._points.forEach((point) => {
      let x1 = point.x;
      let y1 = point.y;

      x1 = nsx + ((x1 - sx) * (nex - nsx)) / (ex - sx);
      y1 = nsy + ((y1 - sy) * (ney - nsy)) / (ey - sy);

      point.x = x1;
      point.y = y1;
    });
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
    strokeColor: this.setStrokeColor.bind(this),
    strokeWidth: this.setStrokeWidth.bind(this),
    strokeStyle: this.setStrokeStyle.bind(this),
    opacity: this.setOpacity.bind(this),
    arrowType: this.setArrowType.bind(this),
    points: this.setPoints.bind(this),
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

  serialize(): any {
    return {
      shapeType: "arrow",
      shapeId: this.shapeId,

      points: this.points,

      arrowType: this.arrowType,

      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeStyle: this.strokeStyle,

      opacity: this.opacity,
    };
  }
  static deserialize(serializedShape: any): Shape {
    const { shapeId, points, strokeColor, strokeWidth, strokeStyle, opacity } =
      serializedShape;

    let newShape = new Arrow(points, shapeId);
    newShape._strokeColor = strokeColor;
    newShape._strokeWidth = strokeWidth;
    newShape._strokeStyle = strokeStyle;
    newShape._opacity = opacity;

    return newShape;
  }
}
