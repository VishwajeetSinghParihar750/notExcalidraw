import { useEffect, useRef } from "react";
import ShapeManager from "../../classes/ShapeManager";
import RectangleTool from "../../classes/Tools/RectangleTool";
import { useTool, type Tool } from "../../store/Tools.store";

export default function Canvas() {
  let canvas = useRef<HTMLCanvasElement>(null);

  let shapeManager: ShapeManager = new ShapeManager();
  let rectangleTool: RectangleTool = new RectangleTool(shapeManager);

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
      console.log("addEventListener down");
      switch (activeToolRef.current) {
        case "rect":
          rectangleTool.onMouseDown(e);
          break;

        default:
          break;
      }
    };
    const handleMouseup = (e: MouseEvent) => {
      switch (activeToolRef.current) {
        case "rect":
          rectangleTool.onMouseUp(e);
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

        default:
          break;
      }
    };

    canvas.current.addEventListener("mousedown", handleMouseDown);
    canvas.current.addEventListener("mouseup", handleMouseup);
    canvas.current.addEventListener("mousemove", handleMouseMove);

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
      canvasEl.removeEventListener("mousedown", handleMouseDown);
      canvasEl.removeEventListener("mouseup", handleMouseup);
      canvasEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <canvas
      ref={canvas}
      id="canvas"
      className=" w-screen h-dvh absolute [image-rendering:pixelated]"
    ></canvas>
  );
}
