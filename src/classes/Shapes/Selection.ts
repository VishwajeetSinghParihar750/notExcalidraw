import type { Shape, ShapeType, shapeId } from "./Shape";

import { isSamePoint } from "./Point";
import type { Point } from "./Point";
import type ShapeManager from "../Managers/ShapeManager";
import type { updatePropertySchema } from "../../types/shapeUpdateEvents";

export class Selection implements Shape {
  readonly shapeType: ShapeType = "selection";
  readonly shapeId: shapeId = crypto.randomUUID();
  _shapeManager: ShapeManager;

  private _selectionArea: [Point, Point];
  private _selectedShapes: Shape[] = [];
  private _drawSelectionArea: boolean = true;

  private _enclosingRectanglePadding = 5;
  private _shapeResizeThreshold = 5;

  private shapeManagerPropertyUpdate(payload: updatePropertySchema) {
    this.shapeManager.handleShapeUpdateEvent({
      eventType: "updateProperty",
      shapeId: this.shapeId,
      payload,
    });
  }

  private shapeManagerEnclosingRectangleUpdate() {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    this.shapeManager.handleShapeUpdateEvent({
      eventType: "updateEnclosingRectangle",
      shapeId: this.shapeId,
      payload: { x1: sx, y1: sy, x2: ex, y2: ey },
    });
  }

  get shapeManager() {
    return this._shapeManager;
  }
  get selectionArea(): [Point, Point] {
    return [{ ...this._selectionArea[0] }, { ...this._selectionArea[1] }];
  }

  setSelectionArea(point1: Point, point2: Point) {
    this._selectionArea = [{ ...point1 }, { ...point2 }];
  }

  get selectedShapes(): Shape[] {
    return this._selectedShapes.map((s) => s.clone());
  }

  setSelectedShapes(shapes: Shape[]) {
    this._selectedShapes = shapes;
  }

  get drawSelectionArea() {
    return this._drawSelectionArea;
  }

  setDrawSelectionArea(bool: boolean) {
    this._drawSelectionArea = bool;
    this.shapeManagerPropertyUpdate({ drawSelectionArea: bool });
  }

  get enclosingRectanglePadding() {
    return this._enclosingRectanglePadding;
  }

  get shapeResizeThreshold() {
    return this._shapeResizeThreshold;
  }

  clone() {
    return new Selection(
      [
        structuredClone(this._selectionArea[0]),
        structuredClone(this._selectionArea[1]),
      ],
      this._selectedShapes.map((shape) => shape.clone()),
      this.shapeManager,
    );
  }

  constructor(
    selectionArea: [Point, Point],
    selectedShapes: Shape[],
    shapeMan: ShapeManager,
  ) {
    this._shapeManager = shapeMan;
    this._selectedShapes = selectedShapes;
    this._selectionArea = selectionArea;
  }

  #drawControlPoints(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    ex: number,
    ey: number,
  ) {
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
      let brandColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-brand")
        .trim();
      ctx.strokeStyle = brandColor;
      ctx.fillStyle = brandColor;

      ctx.lineWidth = 1;

      if (this._drawSelectionArea) {
        ctx.save();

        {
          ctx.beginPath();

          ctx.rect(
            this._selectionArea[0].x,
            this._selectionArea[0].y,
            this._selectionArea[1].x - this._selectionArea[0].x,
            this._selectionArea[1].y - this._selectionArea[0].y,
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

          if (this._selectedShapes.length > 1) ctx.setLineDash([2, 4]);

          sx -= this._enclosingRectanglePadding;
          sy -= this._enclosingRectanglePadding;
          ex += this._enclosingRectanglePadding;
          ey += this._enclosingRectanglePadding;

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();

          this.#drawControlPoints(ctx, sx, sy, ex, ey);

          ctx.restore();
        }

        this._selectedShapes.forEach((shape) => {
          let [sx, sy, ex, ey] = shape.getEnclosingRectangle();

          sx -= this._enclosingRectanglePadding;
          sy -= this._enclosingRectanglePadding;
          ex += this._enclosingRectanglePadding;
          ey += this._enclosingRectanglePadding;

          ctx.beginPath();
          ctx.rect(sx, sy, ex - sx, ey - sy);
          ctx.stroke();
        });
      }
    }

    ctx.restore();
  }

  getEnclosingRectangle(): [number, number, number, number] {
    let x1 = 1e18;
    let x2 = -1e18;
    let y1 = 1e18;
    let y2 = -1e18;

    for (let shape of this._selectedShapes) {
      let [sx, sy, ex, ey] = shape.getEnclosingRectangle();
      x1 = Math.min(x1, sx);
      x2 = Math.max(x2, ex);
      y1 = Math.min(y1, sy);
      y2 = Math.max(y2, ey);
    }

    return [x1, y1, x2, y2];
  }

  moveEnclosingRectangle(delX: number, delY: number) {
    this._selectedShapes.forEach((shape) =>
      shape.moveEnclosingRectangle(delX, delY),
    );
    this.shapeManagerEnclosingRectangleUpdate();
  }

  containsPoint(x: number, y: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && y >= sy && y <= ey;
  }

  isControlPoint(): boolean {
    return false;
  }

  isTopLeftCorner(x: number, y: number) {
    let [sx, sy] = this.getEnclosingRectangle();
    sx -= this._enclosingRectanglePadding;
    sy -= this._enclosingRectanglePadding;

    let curPoint: Point = { x: sx, y: sy };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }

  isTopRightCorner(x: number, y: number) {
    let [, sy, ex] = this.getEnclosingRectangle();
    ex += this._enclosingRectanglePadding;
    sy -= this._enclosingRectanglePadding;

    let curPoint: Point = { x: ex, y: sy };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }

  isBottomLeftCorner(x: number, y: number) {
    let [sx, , , ey] = this.getEnclosingRectangle();
    sx -= this._enclosingRectanglePadding;
    ey += this._enclosingRectanglePadding;

    let curPoint: Point = { x: sx, y: ey };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }

  isBottomRightCorner(x: number, y: number) {
    let [, , ex, ey] = this.getEnclosingRectangle();
    ex += this._enclosingRectanglePadding;
    ey += this._enclosingRectanglePadding;

    let curPoint: Point = { x: ex, y: ey };
    let tocheck: Point = { x, y };

    return isSamePoint(curPoint, tocheck);
  }

  isTopBoundary(x: number, y: number) {
    let [sx, sy, ex] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && Math.abs(y - sy) <= 4;
  }

  isBottomBoundary(x: number, y: number) {
    let [sx, , ex, ey] = this.getEnclosingRectangle();
    return x >= sx && x <= ex && Math.abs(y - ey) <= 4;
  }

  isLeftBoundary(x: number, y: number) {
    let [sx, sy, , ey] = this.getEnclosingRectangle();
    return y >= sy && y <= ey && Math.abs(x - sx) <= 4;
  }

  isRightBoundary(x: number, y: number) {
    let [, sy, ex, ey] = this.getEnclosingRectangle();
    return y >= sy && y <= ey && Math.abs(x - ex) <= 4;
  }

  updateEnclosingRectangle(nsx: number, nsy: number, nex: number, ney: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    if (Math.min(ney - nsy, nex - nsx) < this._shapeResizeThreshold) return;

    this._selectedShapes.forEach((shape) => {
      let [x1, y1, x2, y2] = shape.getEnclosingRectangle();

      x1 = nsx + ((x1 - sx) * (nex - nsx)) / (ex - sx);
      y1 = nsy + ((y1 - sy) * (ney - nsy)) / (ey - sy);

      x2 = nsx + ((x2 - sx) * (nex - nsx)) / (ex - sx);
      y2 = nsy + ((y2 - sy) * (ney - nsy)) / (ey - sy);

      shape.updateEnclosingRectangle(x1, y1, x2, y2);
    });

    this.shapeManagerEnclosingRectangleUpdate();
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

    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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

    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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
    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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

    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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

    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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

    this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }

  moveTopLeftCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy + delY;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveTopRightCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy + delY;
    let nex = ex + delX;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopRightCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveBottomLeftCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy;
    let nex = ex;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomLeftCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveBottomRightCorner(delX: number, delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex + delX;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }

  moveTopBoundary(delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy + delY;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveLeftBoundary(delX: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx + delX;
    let nsy = sy;
    let nex = ex;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleTopLeftCornerX(sx, sy, ex, ey, delX);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveRightBoundary(delX: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex + delX;
    let ney = ey;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCornerX(sx, sy, ex, ey, delX);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
  }
  moveBottomBoundary(delY: number) {
    let [sx, sy, ex, ey] = this.getEnclosingRectangle();

    let nsx = sx;
    let nsy = sy;
    let nex = ex;
    let ney = ey + delY;

    if (this.selectedShapes.find((shape) => shape.shapeType == "text"))
      this.scaleBottomRightCorner(sx, sy, ex, ey, delY);
    else this.updateEnclosingRectangle(nsx, nsy, nex, ney);
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
