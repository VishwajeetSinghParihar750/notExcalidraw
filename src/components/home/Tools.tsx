import { useState, type ReactElement } from "react";

import type { Tool } from "../../store/Tools.store";
import { useTool } from "../../store/Tools.store";

type toolsInfo = {
  id: Tool;
  element: ReactElement;
};

export default function Tools() {
  let [locked, setLocked] = useState<boolean>(false);

  let selectedTool = useTool((state) => state.selectedTool);
  let setSelectedTool = useTool((state) => state.setSelectedTool);

  const tools: toolsInfo[] = [
    {
      id: "cursor",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 22 22"
          stroke-width="1.25"
          className={selectedTool == "cursor" ? "fill-fg" : "none"}
        >
          <g
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M6 6l4.153 11.793a0.365 .365 0 0 0 .331 .207a0.366 .366 0 0 0 .332 -.207l2.184 -4.793l4.787 -1.994a0.355 .355 0 0 0 .213 -.323a0.355 .355 0 0 0 -.213 -.323l-11.787 -4.36z"></path>
            <path d="M13.5 13.5l4.5 4.5"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "grab",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.25">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5"></path>
            <path d="M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5"></path>
            <path d="M14 5.5a1.5 1.5 0 0 1 3 0v6.5"></path>
            <path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "rect",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          className={selectedTool == "rect" ? "fill-fg" : "none"}
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          </g>
        </svg>
      ),
    },
    {
      id: "rotrect",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          className={selectedTool == "rotrect" ? "fill-fg" : "none"}
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "circle",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          className={selectedTool == "circle" ? "fill-fg" : "none"}
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <circle cx="12" cy="12" r="9"></circle>
          </g>
        </svg>
      ),
    },
    {
      id: "aero",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="15" y1="16" x2="19" y2="12"></line>
            <line x1="15" y1="8" x2="19" y2="12"></line>
          </g>
        </svg>
      ),
    },
    {
      id: "line",
      element: (
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
          <path d="M4.167 10h11.666" stroke-width="1.5"></path>
        </svg>
      ),
    },
    {
      id: "pen",
      element: (
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
          <g stroke-width="1.25">
            <path
              clip-rule="evenodd"
              d="m7.643 15.69 7.774-7.773a2.357 2.357 0 1 0-3.334-3.334L4.31 12.357a3.333 3.333 0 0 0-.977 2.357v1.953h1.953c.884 0 1.732-.352 2.357-.977Z"
            ></path>
            <path d="m11.25 5.417 3.333 3.333"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "text",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="4" y1="20" x2="7" y2="20"></line>
            <line x1="14" y1="20" x2="21" y2="20"></line>
            <line x1="6.9" y1="15" x2="13.8" y2="15"></line>
            <line x1="10.2" y1="6.3" x2="16" y2="20"></line>
            <polyline points="5 20 11 4 13 4 20 20"></polyline>
          </g>
        </svg>
      ),
    },
    {
      id: "eraser",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g stroke-width="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"></path>
            <path d="M18 13.3l-6.3 -6.3"></path>
          </g>
        </svg>
      ),
    },
  ];
  return (
    <div className=" flex items-center gap-1 rounded-lg p-1 shadow-lg bg-bg-muted w-fit ">
      <div
        className={
          locked
            ? " bg-brand-muted p-2 rounded-lg cursor-pointer"
            : "p-2 rounded-lg cursor-pointer"
        }
        onClick={() => setLocked((lck) => !lck)}
      >
        <div className="w-4 h-4">
          {locked ? (
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
              <g stroke-width="1.25">
                <path d="M13.542 8.542H6.458a2.5 2.5 0 0 0-2.5 2.5v3.75a2.5 2.5 0 0 0 2.5 2.5h7.084a2.5 2.5 0 0 0 2.5-2.5v-3.75a2.5 2.5 0 0 0-2.5-2.5Z"></path>
                <path d="M10 13.958a1.042 1.042 0 1 0 0-2.083 1.042 1.042 0 0 0 0 2.083Z"></path>
                <path d="M6.667 8.333V5.417C6.667 3.806 8.159 2.5 10 2.5c1.841 0 3.333 1.306 3.333 2.917v2.916"></path>
              </g>
            </svg>
          ) : (
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
              <g>
                <path
                  d="M13.542 8.542H6.458a2.5 2.5 0 0 0-2.5 2.5v3.75a2.5 2.5 0 0 0 2.5 2.5h7.084a2.5 2.5 0 0 0 2.5-2.5v-3.75a2.5 2.5 0 0 0-2.5-2.5Z"
                  stroke="currentColor"
                  stroke-width="1.25"
                ></path>
                <path
                  d="M10 13.958a1.042 1.042 0 1 0 0-2.083 1.042 1.042 0 0 0 0 2.083Z"
                  stroke="currentColor"
                  stroke-width="1.25"
                ></path>
                <mask
                  id="UnlockedIcon"
                  maskUnits="userSpaceOnUse"
                  x="6"
                  y="1"
                  width="9"
                  height="9"
                  className="mask-alpha"
                >
                  <path
                    stroke="none"
                    d="M6.399 9.561V5.175c0-.93.401-1.823 1.116-2.48a3.981 3.981 0 0 1 2.693-1.028c1.01 0 1.98.37 2.694 1.027.715.658 1.116 1.55 1.116 2.481"
                    fill="#fff"
                  ></path>
                </mask>
                <g mask="url(#UnlockedIcon)">
                  <path
                    stroke="none"
                    d="M5.149 9.561v1.25h2.5v-1.25h-2.5Zm5.06-7.894V.417v1.25Zm2.559 3.508v1.25h2.5v-1.25h-2.5ZM7.648 8.51V5.175h-2.5V8.51h2.5Zm0-3.334c0-.564.243-1.128.713-1.561L6.668 1.775c-.959.883-1.52 2.104-1.52 3.4h2.5Zm.713-1.561a2.732 2.732 0 0 1 1.847-.697v-2.5c-1.31 0-2.585.478-3.54 1.358L8.36 3.614Zm1.847-.697c.71 0 1.374.26 1.847.697l1.694-1.839a5.231 5.231 0 0 0-3.54-1.358v2.5Zm1.847.697c.47.433.713.997.713 1.561h2.5c0-1.296-.56-2.517-1.52-3.4l-1.693 1.839Z"
                    fill="currentColor"
                  ></path>
                </g>
              </g>
            </svg>
          )}
        </div>
      </div>
      <div className="w-[.1px] bg-bg-muted h-6"></div>
      {tools.map((curtool) => {
        return (
          <div
            className={
              "" + selectedTool == curtool.id
                ? " bg-brand-muted p-2 rounded-lg cursor-pointer"
                : "p-2 rounded-lg cursor-pointer"
            }
            onClick={() => setSelectedTool(curtool.id)}
          >
            <div className="w-4 h-4">{curtool.element}</div>
          </div>
        );
      })}
    </div>
  );
}
