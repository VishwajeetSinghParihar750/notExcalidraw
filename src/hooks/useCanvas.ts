import type React from "react";
import ShapeManager from "../classes/Managers/ShapeManager";
import ToolMangager from "../classes/Managers/ToolManager";
import { useEffect } from "react";
import { Rectangle } from "../classes/Shapes/Rectangle";
import { RotatedRecangle } from "../classes/Shapes/RotatedRectangle";
import { Circle } from "../classes/Shapes/Circle";
import type { Shape, ShapeData, ShapeType } from "../classes/Shapes/Shape";
import { Arrow } from "../classes/Shapes/Arrow";
import { Line } from "../classes/Shapes/Line";
import { Pen } from "../classes/Shapes/Pen";
import { Selection } from "../classes/Shapes/Selection";
import { Text } from "../classes/Shapes/Text";
import Collab from "../classes/feature/Collab";

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
  useEffect(() => {
    if (!props.canvasRef.current) return;

    let shapeManager = new ShapeManager();

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    let collab: Collab | null;
    if (roomId) collab = new Collab(shapeManager, roomId);

    let shapeManagerShapes = window.localStorage.getItem("shapeManagerShapes");

    // if (shapeManagerShapes) {
    //   let parsedShapes: any[] = JSON.parse(shapeManagerShapes);
    //   parsedShapes
    //     .map((shape) => {
    //       let shapeObj: Shape = Object.setPrototypeOf(
    //         shape,
    //         shapeTypeToPrototype[shape.shapeType as ShapeType].prototype,
    //       );

    //       shape._shapeManager = shapeManager;
    //       return shapeObj;
    //     })
    //     .filter((shape) => shape)
    //     .forEach((shape) => shapeManager.addShape(shape));
    // }

    // let oldShapes = shapeManagerShapes || JSON.stringify([]);

    // const persistShapeManagerShapes = () => {
    //   let shapesToSave = shapeManager.shapes
    //     .filter(
    //       (shape) =>
    //         !(
    //           shape.shapeType == "selection" ||
    //           (shape.shapeType == "text" && (shape as Text).curState == "edit")
    //         ),
    //     )
    //     .map((shape) => {
    //       let { _shapeManager, ...rest } = shape;
    //       return rest;
    //     });

    //   let curShapes = JSON.stringify(shapesToSave);

    //   if (oldShapes != curShapes) {
    //     window.localStorage.setItem("shapeManagerShapes", curShapes);
    //     oldShapes = curShapes;
    //   }
    // };

    // let shapeManagerShapesPersistenceInterval = setInterval(() => {
    //   persistShapeManagerShapes();
    // }, 5000);

    //u need to wait for collab to join Room before u init this
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
    // window.addEventListener("beforeunload", persistShapeManagerShapes);
    // window.addEventListener("pagehide", persistShapeManagerShapes);

    let animationid: number;

    let draw = () => {
      for (let shape of Object.values(shapeManager.shapes)) {
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
      // window.removeEventListener("beforeunload", persistShapeManagerShapes);
      // window.removeEventListener("pagehide", persistShapeManagerShapes);

      // clearInterval(shapeManagerShapesPersistenceInterval);
      if (collab) collab.destructor();
    };
  }, []);
}
