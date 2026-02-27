export class Point {
  x: number;
  y: number;

  static isSamePoint(point1: Point, point2: Point): Boolean {
    let threshold = 4;
    return (
      Math.abs(point1.x - point2.x) <= threshold &&
      Math.abs(point1.y - point2.y) <= threshold
    );
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
