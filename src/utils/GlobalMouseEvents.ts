import { useGrabToolPosition } from "../store/Tools.store";

export type globalMouseEvent = {
  clientX: number;
  clientY: number;
  x: number;
  y: number;
  ogX: number;
  ogY?: number;
};

export function getGlobalMouseEvent(e: MouseEvent): globalMouseEvent {
  const { x: grabshiftX, y: grabshiftY } = useGrabToolPosition.getState();
  return {
    clientX: e.clientX - grabshiftX,
    clientY: e.clientY - grabshiftY,
    x: e.x - grabshiftX,
    y: e.y - grabshiftY,
    ogX: e.x,
    ogY: e.y,
  };
}
