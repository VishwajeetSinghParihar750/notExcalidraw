import React, { useEffect, useRef } from "react";
import ShapeManager from "../../classes/ShapeManager";
import RectangleTool from "../../classes/Tools/RectangleTool";
import { useTool, type Tool } from "../../store/Tools.store";
import RotatedRectangleTool from "../../classes/Tools/RotatedRectangleTool";
import CircleTool from "../../classes/Tools/CircleTool";
import LineTool from "../../classes/Tools/LineTool";
import ArrowTool from "../../classes/Tools/ArrowTool";
import PenTool from "../../classes/Tools/PenTool";
import EraserTool from "../../classes/Tools/EraserTool";
import TextTool from "../../classes/Tools/TextTool";

type propsType = {
  editableTextContainer: React.RefObject<HTMLDivElement | null>;
};
export default function Canvas(props: propsType) {
  let canvas = useRef<HTMLCanvasElement>(null);

  const shapeManagerRef = useRef<ShapeManager | null>(null);
  const toolsRef = useRef<{
    rect: RectangleTool;
    rotrect: RotatedRectangleTool;
    circle: CircleTool;
    line: LineTool;
    arrow: ArrowTool;
    pen: PenTool;
    eraser: EraserTool;
    text: TextTool;
  } | null>(null);

  if (!shapeManagerRef.current) {
    const sm = new ShapeManager();
    shapeManagerRef.current = sm;

    toolsRef.current = {
      rect: new RectangleTool(sm),
      rotrect: new RotatedRectangleTool(sm),
      circle: new CircleTool(sm),
      line: new LineTool(sm),
      arrow: new ArrowTool(sm),
      pen: new PenTool(sm),
      eraser: new EraserTool(sm),
      text: new TextTool(sm, props.editableTextContainer),
    };
  }

  let activeToolState = useTool((s) => s.selectedTool);
  let activeToolRef = useRef<Tool>(activeToolState);

  useEffect(() => {
    activeToolRef.current = activeToolState;
  }, [activeToolState]);

  useEffect(() => {
    if (!canvas.current || !toolsRef.current || !shapeManagerRef.current)
      return;
    const canvasEl = canvas.current;
    const tools = toolsRef.current;
    const shapeManager = shapeManagerRef.current;

    const dpr = window.devicePixelRatio;

    let ctx = canvas.current.getContext("2d");
    canvas.current.width = canvas.current.clientWidth * dpr;
    canvas.current.height = canvas.current.clientHeight * dpr;

    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const handleMouseDown = (e: MouseEvent) => {
      // console.log("window down ");
      switch (activeToolRef.current) {
        case "rect":
          tools.rect.onMouseDown(e);
          break;
        case "rotrect":
          tools.rotrect.onMouseDown(e);
          break;
        case "circle":
          tools.circle.onMouseDown(e);
          break;
        case "line":
          tools.line.onMouseDown(e);
          break;
        case "arrow":
          tools.arrow.onMouseDown(e);
          break;
        case "pen":
          tools.pen.onMouseDown(e);
          break;
        case "eraser":
          tools.eraser.onMouseDown(e);
          break;
        case "text":
          tools.text.onMouseDown(e);
          break;
        default:
          break;
      }
    };
    const handleMouseup = (e: MouseEvent) => {
      // console.log("window up");
      switch (activeToolRef.current) {
        case "rect":
          tools.rect.onMouseUp(e);
          break;
        case "rotrect":
          tools.rotrect.onMouseUp(e);
          break;
        case "circle":
          tools.circle.onMouseUp(e);
          break;
        case "line":
          tools.line.onMouseUp(e);
          break;
        case "arrow":
          tools.arrow.onMouseUp(e);
          break;
        case "pen":
          tools.pen.onMouseUp(e);
          break;
        case "eraser":
          tools.eraser.onMouseUp(e);
          break;
        case "text":
          tools.text.onMouseUp(e);
          break;

        default:
          break;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      // console.log("window move");
      switch (activeToolRef.current) {
        case "rect":
          tools.rect.onMouseMove(e);
          break;
        case "rotrect":
          tools.rotrect.onMouseMove(e);
          break;
        case "circle":
          tools.circle.onMouseMove(e);
          break;
        case "line":
          tools.line.onMouseMove(e);
          break;
        case "arrow":
          tools.arrow.onMouseMove(e);
          break;
        case "pen":
          tools.pen.onMouseMove(e);
          break;
        case "eraser":
          tools.eraser.onMouseMove(e);
          break;
        case "text":
          tools.text.onMouseMove(e);
          break;

        default:
          break;
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseup);
    window.addEventListener("mousemove", handleMouseMove);

    let animationid: number;

    let draw = () => {
      for (let shape of shapeManager.shapes) {
        shape.draw(ctx);
      }
    };

    let work = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      draw();
      animationid = requestAnimationFrame(work);
    };

    animationid = requestAnimationFrame(work);

    return () => {
      cancelAnimationFrame(animationid);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseup);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <canvas
      ref={canvas}
      id="canvas"
      className=" w-screen h-dvh absolute [image-rendering:pixelated] "
    ></canvas>
  );
}
