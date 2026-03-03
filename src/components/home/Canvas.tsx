import React, { useEffect, useRef } from "react";
import { useTool, type Tool } from "../../store/Tools.store";
import useCanvas from "../../hooks/useCanvas";

type propsType = {
  editableTextContainer: React.RefObject<HTMLDivElement | null>;
};
export default function Canvas(props: propsType) {
  let canvas = useRef<HTMLCanvasElement>(null);

  useCanvas({
    canvasRef: canvas,
    editableTextContainerRef: props.editableTextContainer,
  });

  let activeToolState = useTool((s) => s.selectedTool);
  let activeToolRef = useRef<Tool>(activeToolState);

  useEffect(() => {
    activeToolRef.current = activeToolState;
  }, [activeToolState]);

  return (
    <canvas
      ref={canvas}
      id="canvas"
      className=" w-screen h-dvh absolute [image-rendering:pixelated] "
    ></canvas>
  );
}
