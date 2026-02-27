import { Point } from "../classes/Shapes/Point";

export function catmullRomToBezier(
  P0: Point,
  P1: Point,
  P2: Point,
  P3: Point,
): [Point, Point, Point, Point] {
  const B0 = P1;

  const B1 = {
    x: P1.x + (P2.x - P0.x) / 6,
    y: P1.y + (P2.y - P0.y) / 6,
  };

  const B2 = {
    x: P2.x - (P3.x - P1.x) / 6,
    y: P2.y - (P3.y - P1.y) / 6,
  };

  const B3 = P2;

  return [B0, B1, B2, B3];
}
