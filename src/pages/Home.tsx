import Menu from "../components/home/Menu";
import Tools from "../components/home/Tools";
import Canvas from "../components/home/Canvas";
import ToolStyleMenu from "../components/home/ToolStyleMenu";
import { useRef } from "react";

export default function Home() {
  let editableTextContainer = useRef<HTMLDivElement>(null);

  const handleCanvasReset = () => {};
  const handleshare = () => {};

  return (
    <div className="fixed inset-0 bg-bg text-fg ">
      {/* <div className="absolute left-5 top-5">
        <Menu />
      </div> */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 max-md:left-5 max-md:translate-x-0 max-sm:bottom-5 max-sm:top-auto max-sm:left-1/2 max-sm:-translate-x-1/2">
        <Tools />
      </div>

      <div className="absolute right-5 flex top-5  gap-2">
        <button
          className="py-2 px-4 rounded-lg bg-bg-muted hover:bg-brand text-fg text-sm font-semibold cursor-pointer max-lg:hidden"
          onClick={() => handleshare}
        >
          Share
        </button>
        <button
          className="py-2 px-4 rounded-lg bg-bg-muted hover:bg-brand text-fg text-sm font-semibold cursor-pointer max-lg:hidden"
          onClick={() => handleCanvasReset}
        >
          Reset Canvas
        </button>
        <button
          className="p-2 rounded-lg w-10 h-10 bg-bg-muted hover:bg-brand text-fg text-sm font-semibold cursor-pointer hidden max-lg:block"
          onClick={() => handleshare}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M5 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.25 8.917l5.5-2.834M7.25 11.083l5.5 2.834"
              stroke-width="1.5"
            ></path>
          </svg>
        </button>
        <button
          className="p-2.5 w-10 h-10 rounded-lg bg-bg-muted hover:bg-brand text-fg  text-sm font-semibold cursor-pointer hidden max-lg:block "
          onClick={() => handleCanvasReset}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 1920 1920"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0"
              // fill-rule="evenodd"
            ></path>{" "}
          </svg>
        </button>
      </div>

      <div className="absolute left-5 top-24 overflow-hidden z-0">
        <ToolStyleMenu />
      </div>
      <div className="fixed inset-0 -z-2" ref={editableTextContainer}>
        <Canvas editableTextContainer={editableTextContainer} />
      </div>
    </div>
  );
}
