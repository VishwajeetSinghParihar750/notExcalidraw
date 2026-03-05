import React, { useRef } from "react";
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

  return (
    <canvas
      ref={canvas}
      id="canvas"
      className=" w-screen h-dvh absolute [image-rendering:pixelated] "
    ></canvas>
  );
}
