export type Point = {
  x: number;
  y: number;
};
export function isSamePoint(point1: Point, point2: Point): Boolean {
  let threshold = 4;
  return (
    Math.abs(point1.x - point2.x) <= threshold &&
    Math.abs(point1.y - point2.y) <= threshold
  );
}
