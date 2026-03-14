import type { Shape, ShapeType } from "./Shape";
import { isSamePoint } from "./Point";
import type { Point } from "./Point";
import {
  useToolStyle,
  type backgroundColor,
  type edgeRadius,
  type fillStyle,
  type opacity,
  type strokeColor,
  type strokeStyle,
  type strokeWidth,
} from "../../store/Tools.store";
import { catmullRomToBezier } from "../../utils/Line";
import {
  getBackgroundColorString,
  getStrokeColorString,
} from "../../utils/Theme";

export class Line implements Shape {
  shapeType: ShapeType = "line";
  // style properties
  backgroundColor: backgroundColor;
  strokeColor: strokeColor;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  edgeRadius: edgeRadius;
  opacity: opacity;
  fillStyle: fillStyle;

  // shape definition

  points: Point[];
  clone() {
    let line = new Line(structuredClone(this.points));

    line.setBackgroundColor(this.backgroundColor);
    line.setEdgeRadius(this.edgeRadius);
    line.setFillStyle(this.fillStyle);
    line.setOpacity(this.opacity);
    line.setStrokeColor(this.strokeColor);
    line.setStrokeWidth(this.strokeWidth);
    line.setStrokeStyle(this.strokeStyle);
    return line;
  }

  constructor(points: Point[]) {
    this.points = points;

    let {
      backgroundColor,
      strokeColor,
      strokeWidth,
      strokeStyle,
      edgeRadius,
      opacity,
      fillStyle,
    } = useToolStyle.getState();

    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
    this.strokeStyle = strokeStyle;
    this.edgeRadius = edgeRadius;
    this.opacity = opacity;
    this.fillStyle = fillStyle;
  }
  setBackgroundColor(color: backgroundColor) {
    this.backgroundColor = color;
  }

  setStrokeColor(color: strokeColor) {
    this.strokeColor = color;
  }

  setStrokeWidth(width: strokeWidth) {
    this.strokeWidth = width;
  }

  setStrokeStyle(style: strokeStyle) {
    this.strokeStyle = style;
  }

  setEdgeRadius(radius: edgeRadius) {
    this.edgeRadius = radius;
  }

  setOpacity(opacity: opacity) {
    this.opacity = opacity;
  }

  setFillStyle(style: fillStyle) {
    this.fillStyle = style;
  }

  update(points: Point[]) {
    this.points = points;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (
      this.points.length < 2 ||
      (this.points.length == 2 && isSamePoint(this.points[0], this.points[1]))
    )
      return;

    ctx.save();

    //
    {
      ctx.globalAlpha = this.opacity / 100;

      {
        ctx.save();

        ctx.strokeStyle = getStrokeColorString(this.strokeColor);
        ctx.lineWidth = this.strokeWidth;

        if (this.strokeStyle == "smalldotted") ctx.setLineDash([4, 8]);
        else if (this.strokeStyle == "dotted") ctx.setLineDash([8, 16]);

        ctx.beginPath();

        if (this.edgeRadius == 0) {
          ctx.moveTo(this.points[0].x, this.points[0].y);
          let len = this.points.length;

          for (let i = 1; i < len; i++) {
            ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
            ctx.lineTo(this.points[i].x, this.points[i].y);
          }
          ctx.stroke();
        } else {
          //
          ctx.moveTo(this.points[0].x, this.points[0].y);

          let points = [
            this.points[0],
            ...this.points,
            this.points[this.points.length - 1],
          ];
          for (let i = 1; i < points.length - 2; i++) {
            //
            let p0 = points[i - 1];
            let p1 = points[i];
            let p2 = points[i + 1];
            let p3 = points[i + 2];

            let [_, b1, b2, b3] = catmullRomToBezier(p0, p1, p2, p3);
            ctx.bezierCurveTo(b1.x, b1.y, b2.x, b2.y, b3.x, b3.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      let bgColor = getBackgroundColorString(this.backgroundColor);
      if (
        bgColor != "none" &&
        this.points.length > 2 &&
        isSamePoint(this.points[0], this.points[this.points.length - 1])
      ) {
        //
        ctx.save();

        if (this.fillStyle == "fill") {
          ctx.fillStyle = bgColor;
          ctx.fill();
        } else if (this.fillStyle == "line") {
          let [x1, y1, x2, y2] = this.getEnclosingRectangle();
          x1 /= 2;
          y1 /= 2;
          x2 *= 2;
          y2 *= 2;

          ctx.clip();
          ctx.lineWidth = 1;
          ctx.strokeStyle = bgColor;

          let d = Math.ceil(
            Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
          );
          ctx.beginPath();

          let gap = this.strokeWidth * 5;
          for (let pos = gap; pos < d * 2; pos += gap) {
            //
            ctx.moveTo(x1 + pos, y1);
            ctx.lineTo(x1, y1 + pos);
          }
          ctx.stroke();
        } else if (this.fillStyle == "crosslines") {
          ctx.clip();
          ctx.lineWidth = 1;
          ctx.strokeStyle = bgColor;

          let [x1, y1, x2, y2] = this.getEnclosingRectangle();
          x1 /= 2;
          y1 /= 2;
          x2 *= 2;
          y2 *= 2;
          let d = Math.ceil(
            Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)),
          );
          ctx.beginPath();

          let gap = this.strokeWidth * 5;
          for (let pos = gap; pos < d * 2; pos += gap) {
            //
            ctx.moveTo(x1 + pos, y1);
            ctx.lineTo(x1, y1 + pos);
          }
          for (let pos = gap; pos < d * 2; pos += gap) {
            //
            ctx.moveTo(x2, y1 + pos);
            ctx.lineTo(x2 - pos, y1);
          }
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;
    for (let point of this.points) {
      x1 = Math.min(x1, point.x);
      x2 = Math.max(x2, point.x);
      y1 = Math.min(y1, point.y);
      y2 = Math.max(y2, point.y);
    }
    return [x1, y1, x2, y2];
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    for (let point of this.points) {
      //
      point.x += delX;
      point.y += delY;
    }
  }

  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    this.points.forEach((point) => {
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
}
