import type { Shape, ShapeType } from "./Shape";

import { Point } from "./Point";

export class Selection implements Shape {
  shapeType: ShapeType = "selection";

  selectionArea: [Point, Point];
  selectedShapes: Shape[] = [];
  drawSelectionArea: boolean = true;
  padding = 5;

  constructor(selectionArea: [Point, Point], selectedShapes: Shape[]) {
    this.selectedShapes = selectedShapes;
    this.selectionArea = selectionArea;
  }
  setDrawSelectionArea(bool: boolean) {
    this.drawSelectionArea = bool;
  }

  #drawControlPoints(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    ex: number,
    ey: number,
  ) {
    //
    let toinside = 4;

    let length = 8;

    let sq1x = sx - length + toinside;
    let sq1y = sy - length + toinside;

    let sq2x = ex - toinside;
    let sq2y = sy - length + toinside;

    let sq3x = sx - length + toinside;
    let sq3y = ey - toinside;

    let sq4x = ex - toinside;
    let sq4y = ey - toinside;

    ctx.beginPath();
    ctx.roundRect(sq1x, sq1y, length, length, 2);
    ctx.roundRect(sq2x, sq2y, length, length, 2);
    ctx.roundRect(sq3x, sq3y, length, length, 2);
    ctx.roundRect(sq4x, sq4y, length, length, 2);

    ctx.fill();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    {
      //
      let brandColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-brand")
        .trim();
      ctx.strokeStyle = brandColor;
      ctx.fillStyle = brandColor;

      ctx.lineWidth = 1;

      if (this.drawSelectionArea) {
        ctx.save();

        {
          ctx.beginPath();

          ctx.rect(
            this.selectionArea[0].x,
            this.selectionArea[0].y,
            this.selectionArea[1].x - this.selectionArea[0].x,
            this.selectionArea[1].y - this.selectionArea[0].y,
          );

          ctx.stroke();
          ctx.globalAlpha = 0.1;
          ctx.fill();
        }
        ctx.restore();
      }

      {
        {
          ctx.save();

          if (this.selectedShapes.length > 1) ctx.setLineDash([2, 4]);
          //
          sx -= this.padding;
          sy -= this.padding;
          ex += this.padding;
          ey += this.padding;

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();

          this.#drawControlPoints(ctx, sx, sy, ex, ey);

          ctx.restore();
        }
        this.selectedShapes.forEach((shape) => {
          let [sx, sy, ex, ey] = shape.getEnclosingRectangle();

          sx -= this.padding;
          sy -= this.padding;
          ex += this.padding;
          ey += this.padding;

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();
        });
      }

      //
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;

    for (let shape of this.selectedShapes) {
      let [sx, sy, ex, ey] = shape.getEnclosingRectangle();
      x1 = Math.min(x1, sx);
      x2 = Math.max(x2, ex);
      y1 = Math.min(y1, sy);
      y2 = Math.max(y2, ey);
    }

    return [x1, y1, x2, y2];
  }

  // updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {}

  moveEnclosingRectangle(delX: number, delY: number) {
    this.selectedShapes.forEach((shape) =>
      shape.moveEnclosingRectangle(delX, delY),
    );
  }

  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    return x >= sx && x <= ex && y >= sy && y <= ey;
  }

  isControlPoint(x: number, y: number): boolean {
    return false;
  }

  isTopLeftCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    sx -= this.padding;
    sy -= this.padding;

    let curPoint = new Point(sx, sy);
    let tocheck = new Point(x, y);

    return Point.isSamePoint(curPoint, tocheck);
  }
  isTopRightCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    ex += this.padding;
    sy -= this.padding;

    let curPoint = new Point(ex, sy);
    let tocheck = new Point(x, y);

    return Point.isSamePoint(curPoint, tocheck);
  }
  isBottomLeftCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    sx -= this.padding;
    ey += this.padding;

    let curPoint = new Point(sx, ey);
    let tocheck = new Point(x, y);

    return Point.isSamePoint(curPoint, tocheck);
  }
  isBottomRightCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    ex += this.padding;
    ey += this.padding;

    let curPoint = new Point(ex, ey);
    let tocheck = new Point(x, y);

    return Point.isSamePoint(curPoint, tocheck);
  }

  isTopBoundary(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && Math.abs(y - sy) <= 4;
  }

  isBottomBoundary(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && Math.abs(y - ey) <= 4;
  }
  isLeftBoundary(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return y >= sy && y <= ey && Math.abs(x - sx) <= 4;
  }
  isRightBoundary(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return y >= sy && y <= ey && Math.abs(x - ex) <= 4;
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
