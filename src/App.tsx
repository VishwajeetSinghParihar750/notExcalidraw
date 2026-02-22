import { useEffect, useRef, useState } from "react";

import Home from "./pages/Home.tsx";

interface shape {
  draw: (ctx: CanvasRenderingContext2D) => void;
}

class rectangle implements shape {
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  update(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeRect(
      this.startX,
      this.startY,
      this.endX - this.startX,
      this.endY - this.startY,
    );
  }
}

class line implements shape {
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  update(startX: number, startY: number, endX: number, endY: number) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();
  }
}

function App() {
  let canvas = useRef<HTMLCanvasElement>(null);

  let [makeRect, setMakeRect] = useState(false);
  let [makeLine, setMakeLine] = useState(false);

  let shapes = useRef<shape[]>([]);

  let [makingShape, setMakingShape] = useState(false);

  //
  useEffect(() => {
    if (!canvas.current) return;

    const dpr = window.devicePixelRatio;

    let ctx = canvas.current.getContext("2d");
    canvas.current.width = canvas.current.clientWidth * dpr;
    canvas.current.height = canvas.current.clientHeight * dpr;

    if (!ctx) return;
    ctx.scale(dpr, dpr);

    //

    canvas.current.onmousemove = (e) => {
      if (e.target != e.currentTarget) {
        return;
      }
      console.log("mousemove", makeRect, makeLine, makingShape);
      if (makingShape) {
        if (makeRect) {
          let rect = shapes.current.at(-1) as rectangle;
          rect.update(rect.startX, rect.startY, e.clientX, e.clientY);
        } else if (makeLine) {
          let line = shapes.current.at(-1) as line;
          line.update(line.startX, line.startY, e.clientX, e.clientY);
        }
      }
    };

    canvas.current.onmousedown = (e) => {
      if (e.target != e.currentTarget) {
        return;
      }
      console.log("mousedown", makeRect, makeLine, makingShape);
      if (makeRect) {
        setMakingShape(() => true);

        shapes.current.push(
          new rectangle(e.clientX, e.clientY, e.clientX, e.clientY),
        );
        //
      } else if (makeLine) {
        setMakingShape(() => true);

        shapes.current.push(
          new line(e.clientX, e.clientY, e.clientX, e.clientY),
        );
        //
      }
    };

    canvas.current.onmouseup = (e) => {
      if (e.target != e.currentTarget) {
        return;
      }
      console.log("mouseup", makeRect, makeLine, makingShape);
      if (makeRect) {
        setMakeRect(() => false);
        setMakingShape(() => false);
      } else if (makeLine) {
        setMakeLine(() => false);
        setMakingShape(() => false);
      }
    };
    //
    let animationid: number;

    let draw = () => {
      //
      for (let shape of shapes.current) {
        shape.draw(ctx);
      }
    };

    let work = () => {
      //
      ctx.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
      draw();
      animationid = requestAnimationFrame(work);
    };

    animationid = requestAnimationFrame(work);

    return () => {
      cancelAnimationFrame(animationid);
    };
  }, [makingShape, makeRect, makeLine]);

  console.log(makeRect, makeLine, makingShape);
  return (
    <body className="bg-bg text-fg">
      <Home />
      {/* <canvas
        ref={canvas}
        id="canvas"
        className=" w-screen h-screen bg-[#e3c5c533] [image-rendering:pixelated]"
      ></canvas>

      <button
        className={
          makeRect
            ? "absolute left-0 top-0  p-2 border cursor-pointer  bg-green-500 "
            : "absolute left-0 top-0  p-2 border cursor-pointer bg-red-500 "
        }
        onClick={() => setMakeRect(() => true)}
      >
        make_rect
      </button>
      <button
        className={
          makeLine
            ? "absolute left-100 top-0  p-2 border cursor-pointer  bg-green-500 "
            : "absolute left-100 top-0  p-2 border cursor-pointer bg-red-500 "
        }
        onClick={() => setMakeLine(() => true)}
      >
        make_line
      </button> */}
    </body>
  );
}

export default App;
