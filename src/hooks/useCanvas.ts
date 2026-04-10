import type React from "react";
import { useEffect } from "react";
import { Rectangle } from "../classes/Shapes/Rectangle";
import { RotatedRecangle } from "../classes/Shapes/RotatedRectangle";
import { Circle } from "../classes/Shapes/Circle";
import { Arrow } from "../classes/Shapes/Arrow";
import { Line } from "../classes/Shapes/Line";
import { Pen } from "../classes/Shapes/Pen";
import { Selection } from "../classes/Shapes/Selection";
import { Text } from "../classes/Shapes/Text";
import CanvasManager from "../classes/Managers/CanvasManager";
import { useCanvasManager } from "../store/CanvasManager.store";

type useCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  editableTextContainerRef: React.RefObject<HTMLDivElement | null>;
};

let shapeTypeToPrototype = {
  rect: Rectangle,
  circle: Circle,
  rotrect: RotatedRecangle,
  arrow: Arrow,
  line: Line,
  pen: Pen,
  selection: Selection,
  text: Text,
};

export default function useCanvas(props: useCanvasProps) {
  const { setCanvasManager } = useCanvasManager();

  useEffect(() => {
    if (!props.canvasRef.current) return;

    const canvasEl = props.canvasRef.current;
    const dpr = window.devicePixelRatio;

    let ctx = canvasEl.getContext("2d");
    canvasEl.width = canvasEl.clientWidth * dpr;
    canvasEl.height = canvasEl.clientHeight * dpr;

    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const canvasManager = new CanvasManager(
      props.canvasRef,
      props.editableTextContainerRef,
    );
    setCanvasManager(canvasManager);

    const handleDocumentResize = () => {
      const dpr = window.devicePixelRatio;
      canvasEl.width = canvasEl.clientWidth * dpr;
      canvasEl.height = canvasEl.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleDocumentResize);

    let animationid: number;

    let work = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      canvasManager.draw(ctx);
      animationid = requestAnimationFrame(work);
    };

    animationid = requestAnimationFrame(work);

    return () => {
      cancelAnimationFrame(animationid);
      window.removeEventListener("resize", handleDocumentResize);
      canvasManager.destructor();
      setCanvasManager(null);
    };
  }, []);
}
