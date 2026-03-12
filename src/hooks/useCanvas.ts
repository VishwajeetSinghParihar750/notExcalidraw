import type React from "react";
import ShapeManager from "../classes/Managers/ShapeManager";
import ToolMangager from "../classes/Managers/ToolManager";
import { useEffect } from "react";

type useCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  editableTextContainerRef: React.RefObject<HTMLDivElement | null>;
};
export default function useCanvas(props: useCanvasProps) {
  useEffect(() => {
    if (!props.canvasRef.current) return;

    let shapeManager = new ShapeManager();

    let toolManager = new ToolMangager(
      shapeManager,
      props.canvasRef,
      props.editableTextContainerRef,
    ); //

    const canvasEl = props.canvasRef.current;

    const dpr = window.devicePixelRatio;

    let ctx = canvasEl.getContext("2d");
    canvasEl.width = canvasEl.clientWidth * dpr;
    canvasEl.height = canvasEl.clientHeight * dpr;

    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const handleMouseDown = (e: MouseEvent) => {
      console.log("gotit");
      toolManager.onMouseDown(e);
    };
    const handleMouseup = (e: MouseEvent) => {
      toolManager.onMouseUp(e);
    };
    const handleMouseMove = (e: MouseEvent) => {
      toolManager.onMouseMove(e);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      toolManager.onKeyPress(e);
    };

    const handleDocumentResize = () => {
      const dpr = window.devicePixelRatio;
      canvasEl.width = canvasEl.clientWidth * dpr;
      canvasEl.height = canvasEl.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    document.addEventListener("pointerdown", handleMouseDown);
    document.addEventListener("pointerup", handleMouseup);
    document.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleDocumentResize);

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
      toolManager.destructor();

      document.removeEventListener("pointerdown", handleMouseDown);
      document.removeEventListener("pointerup", handleMouseup);
      document.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleDocumentResize);
    };
  }, []);
}
