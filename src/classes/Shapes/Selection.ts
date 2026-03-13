import type { Shape, ShapeType } from "./Shape";

import { isSamePoint } from "./Point";
import type { Point } from "./Point";

export class Selection implements Shape {
  shapeType: ShapeType = "selection";

  selectionArea: [Point, Point];
  selectedShapes: Shape[] = [];
  drawSelectionArea: boolean = true;
  enclosingRectanglePadding = 5;

  shapeResizeThreshold = 5;

  clone() {
    return new Selection(
      this.selectionArea,
      this.selectedShapes.map((shape) => shape.clone()),
    );
  }

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
          sx -= this.enclosingRectanglePadding;
          sy -= this.enclosingRectanglePadding;
          ex += this.enclosingRectanglePadding;
          ey += this.enclosingRectanglePadding;

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();

          this.#drawControlPoints(ctx, sx, sy, ex, ey);

          ctx.restore();
        }
        this.selectedShapes.forEach((shape) => {
          let [sx, sy, ex, ey] = shape.getEnclosingRectangle();

          sx -= this.enclosingRectanglePadding;
          sy -= this.enclosingRectanglePadding;
          ex += this.enclosingRectanglePadding;
          ey += this.enclosingRectanglePadding;

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

  moveEnclosingRectangle(delX: number, delY: number) {
    this.selectedShapes.forEach((shape) =>
      shape.moveEnclosingRectangle(delX, delY),
    );
  }
  updateEnclosingRectangle(x1: number, y1: number, x2: number, y2: number) {}

  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    return x >= sx && x <= ex && y >= sy && y <= ey;
  }

  isControlPoint(x: number, y: number): boolean {
    return false;
  }

  isTopLeftCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    sx -= this.enclosingRectanglePadding;
    sy -= this.enclosingRectanglePadding;

    let curPoint: Point = { x: sx, y: sy };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }
  isTopRightCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    ex += this.enclosingRectanglePadding;
    sy -= this.enclosingRectanglePadding;

    let curPoint: Point = { x: ex, y: sy };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }
  isBottomLeftCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    sx -= this.enclosingRectanglePadding;
    ey += this.enclosingRectanglePadding;

    let curPoint: Point = { x: sx, y: ey };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }
  isBottomRightCorner(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    ex += this.enclosingRectanglePadding;
    ey += this.enclosingRectanglePadding;

    let curPoint: Point = { x: ex, y: ey };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
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

  updateShapesEnclsosingRectangles(
    oldRect: [number, number, number, number],
    newRect: [number, number, number, number],
  ) {
    let [sx, sy, ex, ey] = oldRect;
    let [nsx, nsy, nex, ney] = newRect;

    if (Math.min(ney - nsy, nex - nsx) < this.shapeResizeThreshold) return;

    this.selectedShapes.forEach((shape) => {
      let [x1, y1, x2, y2] = shape.getEnclosingRectangle();

      x1 = nsx + ((x1 - sx) * (nex - nsx)) / (ex - sx);
      y1 = nsy + ((y1 - sy) * (ney - nsy)) / (ey - sy);

      x2 = nsx + ((x2 - sx) * (nex - nsx)) / (ex - sx);
      y2 = nsy + ((y2 - sy) * (ney - nsy)) / (ey - sy);

      shape.updateEnclosingRectangle(x1, y1, x2, y2);
    });
  }

  scaleTopLeftCorner(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delY: number,
  ) {
    let nsy = sy + delY;
    let nex = ex;
    let ney = ey;

    let nsx = nex - ((ex - sx) * (ney - nsy)) / (ey - sy);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }
  scaleTopLeftCornerX(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delX: number,
  ) {
    let nsx = sx + delX;
    let nex = ex;
    let ney = ey;

    let nsy = ney - ((nex - nsx) * (ey - sy)) / (ex - sx);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }
  scaleTopRightCorner(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delY: number,
  ) {
    let nsy = sy + delY;
    let nsx = sx;
    let ney = ey;

    let nex = nsx + ((ex - sx) * (ney - nsy)) / (ey - sy);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }
  scaleBottomRightCorner(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delY: number,
  ) {
    let nsx = sx;
    let nsy = sy;
    let ney = ey + delY;
    let nex = nsx + ((ex - sx) * (ney - nsy)) / (ey - sy);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }
  scaleBottomRightCornerX(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delX: number,
  ) {
    let nsx = sx;
    let nsy = sy;

    let nex = ex + delX;
    let ney = nsy + ((nex - nsx) * (ey - sy)) / (ex - sx);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }
  scaleBottomLeftCorner(
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    delY: number,
  ) {
    let nex = ex;
    let nsy = sy;

    let ney = ey + delY;
    let nsx = nex - ((ex - sx) * (ney - nsy)) / (ey - sy);

    this.updateShapesEnclsosingRectangles(
      [sx, sy, ex, ey],
      [nsx, nsy, nex, ney],
    );
  }

  moveTopLeftCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy + delY;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveTopRightCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy + delY;
    let nex = ex + delX;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopRightCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveBottomLeftCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy;
    let nex = ex;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomLeftCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveBottomRightCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex + delX;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }

  moveTopBoundary(delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy + delY;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveLeftBoundary(delX: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCornerX(sx, sy, ex, ey, delX);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveRightBoundary(delX: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex + delX;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCornerX(sx, sy, ex, ey, delX);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
  }
  moveBottomBoundary(delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCorner(sx, sy, ex, ey, delY);
    else
      this.updateShapesEnclsosingRectangles(
        [sx, sy, ex, ey],
        [nsx, nsy, nex, ney],
      );
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
