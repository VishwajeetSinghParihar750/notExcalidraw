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

  let shapeManager: ShapeManager = new ShapeManager();
  let rectangleTool: RectangleTool = new RectangleTool(shapeManager);
  let rotatedRectangleTool: RotatedRectangleTool = new RotatedRectangleTool(
    shapeManager,
  );
  let circleTool: CircleTool = new CircleTool(shapeManager);
  let lineTool: LineTool = new LineTool(shapeManager);
  let arrowTool: ArrowTool = new ArrowTool(shapeManager);
  let penTool: PenTool = new PenTool(shapeManager);
  let eraserTool: EraserTool = new EraserTool(shapeManager);

  let textTool: TextTool = new TextTool(
    shapeManager,
    props.editableTextContainer,
  );

  let activeToolState = useTool((s) => s.selectedTool);
  let activeToolRef = useRef<Tool>(activeToolState);

  useEffect(() => {
    activeToolRef.current = activeToolState;
  }, [activeToolState]);

  useEffect(() => {
    if (!canvas.current) return;
    const canvasEl = canvas.current;

    const dpr = window.devicePixelRatio;

    let ctx = canvas.current.getContext("2d");
    canvas.current.width = canvas.current.clientWidth * dpr;
    canvas.current.height = canvas.current.clientHeight * dpr;

    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const handleMouseDown = (e: MouseEvent) => {
      switch (activeToolRef.current) {
        case "rect":
          rectangleTool.onMouseDown(e);
          break;
        case "rotrect":
          rotatedRectangleTool.onMouseDown(e);
          break;
        case "circle":
          circleTool.onMouseDown(e);
          break;
        case "line":
          lineTool.onMouseDown(e);
          break;
        case "arrow":
          arrowTool.onMouseDown(e);
          break;
        case "pen":
          penTool.onMouseDown(e);
          break;
        case "eraser":
          eraserTool.onMouseDown(e);
          break;
        case "text":
          textTool.onMouseDown(e);
          break;
        default:
          break;
      }
    };
    const handleMouseup = (e: MouseEvent) => {
      console.log("addEventListener up");
      switch (activeToolRef.current) {
        case "rect":
          rectangleTool.onMouseUp(e);
          break;
        case "rotrect":
          rotatedRectangleTool.onMouseUp(e);
          break;
        case "circle":
          circleTool.onMouseUp(e);
          break;
        case "line":
          lineTool.onMouseUp(e);
          break;
        case "arrow":
          arrowTool.onMouseUp(e);
          break;
        case "pen":
          penTool.onMouseUp(e);
          break;
        case "eraser":
          eraserTool.onMouseUp(e);
          break;
        case "text":
          textTool.onMouseUp(e);
          break;

        default:
          break;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      switch (activeToolRef.current) {
        case "rect":
          rectangleTool.onMouseMove(e);
          break;
        case "rotrect":
          rotatedRectangleTool.onMouseMove(e);
          break;
        case "circle":
          circleTool.onMouseMove(e);
          break;
        case "line":
          lineTool.onMouseMove(e);
          break;
        case "arrow":
          arrowTool.onMouseMove(e);
          break;
        case "pen":
          penTool.onMouseMove(e);
          break;
        case "eraser":
          eraserTool.onMouseMove(e);
          break;
        case "text":
          textTool.onMouseMove(e);
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
