import { Arrow } from "../classes/Shapes/Arrow";
import { Circle } from "../classes/Shapes/Circle";
import { Line } from "../classes/Shapes/Line";
import { Pen } from "../classes/Shapes/Pen";
import { Rectangle } from "../classes/Shapes/Rectangle";
import { RotatedRecangle } from "../classes/Shapes/RotatedRectangle";
import { Selection } from "../classes/Shapes/Selection";
import { Text } from "../classes/Shapes/Text";
import { Shape } from "../classes/Shapes/Shape";

const classRegistry = {
  arrow: Arrow,
  line: Line,
  circle: Circle,
  rect: Rectangle,
  rotrect: RotatedRecangle,
  pen: Pen,
  text: Text,
  selection: Selection,
};

export function deserializeShape(serializedShape: any): Shape | undefined {
  let { shapeType } = serializedShape;

  if (classRegistry[shapeType as keyof typeof classRegistry]) {
    let toret =
      classRegistry[shapeType as keyof typeof classRegistry].deserialize(
        serializedShape,
      );
    return toret;
  }
  return undefined;
}
