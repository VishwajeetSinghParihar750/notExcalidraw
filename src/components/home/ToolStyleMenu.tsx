import { useEffect, type ReactElement } from "react";
import { useTool, useToolStyle } from "../../store/Tools.store";
import type {
  arrowType,
  backgroundColor,
  edgeRadius,
  fillStyle,
  fontFamily,
  fontSize,
  opacity,
  strokeColor,
  strokeStyle,
  strokeWidth,
} from "../../store/Tools.store";

export default function ToolStyleMenu() {
  let selectedTool = useTool((s) => s.selectedTool);

  let torender =
    selectedTool == "circle" ||
    selectedTool == "rect" ||
    selectedTool == "rotrect" ||
    selectedTool == "line" ||
    selectedTool == "pen" ||
    selectedTool == "arrow" ||
    selectedTool == "text";

  let strokeColors: strokeColor[] = [
    "#d3d3d3",
    "#ff8383",
    "#3a994c",
    "#56a2e8",
    "#b76100",
  ];
  let bgColors: backgroundColor[] = [
    "#5b2c2c",
    "#043b0c",
    "#154163",
    "#362500",
  ];

  type fillSectionInfo = { fillStyle: fillStyle; element: ReactElement };
  let fillStyles: fillSectionInfo[] = [
    {
      fillStyle: "line",
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
          <path
            d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
            stroke="currentColor"
            stroke-width="1.25"
          ></path>
          <mask
            id="FillHachureIcon"
            maskUnits="userSpaceOnUse"
            x="2"
            y="2"
            width="16"
            height="16"
            className="mask-alpha"
          >
            <path
              d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
              fill="white"
              stroke="currentColor"
              stroke-width="1.25"
            ></path>
          </mask>
          <g mask="url(#FillHachureIcon)">
            <path
              d="M2.258 15.156 15.156 2.258M7.324 20.222 20.222 7.325m-20.444 5.35L12.675-.222m-8.157 18.34L17.416 5.22"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>
      ),
    },
    {
      fillStyle: "crosslines",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g clip-path="url(#a)">
            <path
              d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
              stroke="currentColor"
              stroke-width="1.25"
            ></path>
            <mask
              id="FillCrossHatchIcon"
              maskUnits="userSpaceOnUse"
              x="-1"
              y="-1"
              width="22"
              height="22"
              className="mask-alpha"
            >
              <path
                d="M2.426 15.044 15.044 2.426M7.383 20 20 7.383M0 12.617 12.617 0m-7.98 17.941L17.256 5.324m-2.211 12.25L2.426 4.956M20 12.617 7.383 0m5.234 20L0 7.383m17.941 7.98L5.324 2.745"
                stroke="white"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </mask>
            <g mask="url(#FillCrossHatchIcon)">
              <path
                d="M14.121 2H5.88A3.879 3.879 0 0 0 2 5.879v8.242A3.879 3.879 0 0 0 5.879 18h8.242A3.879 3.879 0 0 0 18 14.121V5.88A3.879 3.879 0 0 0 14.121 2Z"
                fill="currentColor"
              ></path>
            </g>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h20v20H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      fillStyle: "fill",
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="currentColor"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g clip-path="url(#a)">
            <path
              d="M4.91 2.625h10.18a2.284 2.284 0 0 1 2.285 2.284v10.182a2.284 2.284 0 0 1-2.284 2.284H4.909a2.284 2.284 0 0 1-2.284-2.284V4.909a2.284 2.284 0 0 1 2.284-2.284Z"
              stroke="currentColor"
              stroke-width="1.25"
            ></path>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h20v20H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
  ];

  type arrowtypeInfo = { arrowType: arrowType; element: ReactElement };
  let arrowtypeStyles: arrowtypeInfo[] = [
    {
      arrowType: "straight",
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
          <g>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M6 18l12 -12"></path>
            <path d="M18 10v-4h-4"></path>
          </g>
        </svg>
      ),
    },
    {
      arrowType: "curve",
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
          <g>
            <path d="M16,12L20,9L16,6"></path>
            <path d="M6 20c0 -6.075 4.925 -11 11 -11h3"></path>
          </g>
        </svg>
      ),
    },
    {
      arrowType: "snake",
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
          <g>
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4,19L10,19C11.097,19 12,18.097 12,17L12,9C12,7.903 12.903,7 14,7L21,7"></path>
            <path d="M18 4l3 3l-3 3"></path>
          </g>
        </svg>
      ),
    },
  ];
  type strokeWidthInfo = { width: strokeWidth; element: ReactElement };
  let strokeFillWidthStyles: strokeWidthInfo[] = [
    {
      width: 2,
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M4.167 10h11.666"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      width: 4,
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M5 10h10"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      width: 6,
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M5 10h10"
            stroke="currentColor"
            stroke-width="3.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      ),
    },
  ];

  type strokeStyleInfo = { strokeStyle: strokeStyle; element: ReactElement };
  let strokeStyleStyles: strokeStyleInfo[] = [
    {
      strokeStyle: "line",
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
          <path
            d="M4.167 10h11.666"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      ),
    },
    {
      strokeStyle: "dotted",
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
          <g stroke-width="2">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M5 12h2"></path>
            <path d="M17 12h2"></path>
            <path d="M11 12h2"></path>
          </g>
        </svg>
      ),
    },
    {
      strokeStyle: "smalldotted",
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
          <g stroke-width="2">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4 12v.01"></path>
            <path d="M8 12v.01"></path>
            <path d="M12 12v.01"></path>
            <path d="M16 12v.01"></path>
            <path d="M20 12v.01"></path>
          </g>
        </svg>
      ),
    },
  ];

  type edgesRadiusInfo = { radius: edgeRadius; element: ReactElement };
  let edgesRadiusStyles: edgesRadiusInfo[] = [
    {
      radius: 0,
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <svg stroke-width="1.5">
            <path d="M3.33334 9.99998V6.66665C3.33334 6.04326 3.33403 4.9332 3.33539 3.33646C4.95233 3.33436 6.06276 3.33331 6.66668 3.33331H10"></path>
            <path d="M13.3333 3.33331V3.34331"></path>
            <path d="M16.6667 3.33331V3.34331"></path>
            <path d="M16.6667 6.66669V6.67669"></path>
            <path d="M16.6667 10V10.01"></path>
            <path d="M3.33334 13.3333V13.3433"></path>
            <path d="M16.6667 13.3333V13.3433"></path>
            <path d="M3.33334 16.6667V16.6767"></path>
            <path d="M6.66666 16.6667V16.6767"></path>
            <path d="M10 16.6667V16.6767"></path>
            <path d="M13.3333 16.6667V16.6767"></path>
            <path d="M16.6667 16.6667V16.6767"></path>
          </svg>
        </svg>
      ),
    },
    {
      radius: 10,
      element: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          className=""
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <g
            stroke-width="1.5"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4 12v-4a4 4 0 0 1 4 -4h4"></path>
            <line x1="16" y1="4" x2="16" y2="4.01"></line>
            <line x1="20" y1="4" x2="20" y2="4.01"></line>
            <line x1="20" y1="8" x2="20" y2="8.01"></line>
            <line x1="20" y1="12" x2="20" y2="12.01"></line>
            <line x1="4" y1="16" x2="4" y2="16.01"></line>
            <line x1="20" y1="16" x2="20" y2="16.01"></line>
            <line x1="4" y1="20" x2="4" y2="20.01"></line>
            <line x1="8" y1="20" x2="8" y2="20.01"></line>
            <line x1="12" y1="20" x2="12" y2="20.01"></line>
            <line x1="16" y1="20" x2="16" y2="20.01"></line>
            <line x1="20" y1="20" x2="20" y2="20.01"></line>
          </g>
        </svg>
      ),
    },
  ];

  type fontFamilyInfo = { fontFamily: fontFamily; element: ReactElement };
  let fontFamilyStyles: fontFamilyInfo[] = [
    {
      fontFamily: "hand",
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
      fontFamily: "normal",
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
          <g
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5.833 16.667v-10a3.333 3.333 0 0 1 3.334-3.334h1.666a3.333 3.333 0 0 1 3.334 3.334v10M5.833 10.833h8.334"></path>
          </g>
        </svg>
      ),
    },
    {
      fontFamily: "code",
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
            <path d="M7 8l-4 4l4 4"></path>
            <path d="M17 8l4 4l-4 4"></path>
            <path d="M14 4l-4 16"></path>
          </g>
        </svg>
      ),
    },
  ];
  type fontSizeInfo = { fontSize: fontSize; element: ReactElement };
  let fontSizeStyles: fontSizeInfo[] = [
    {
      fontSize: "small",
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
          <g clip-path="url(#a)">
            <path
              d="M14.167 6.667a3.333 3.333 0 0 0-3.334-3.334H9.167a3.333 3.333 0 0 0 0 6.667h1.666a3.333 3.333 0 0 1 0 6.667H9.167a3.333 3.333 0 0 1-3.334-3.334"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h20v20H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      fontSize: "medium",
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
          <g clip-path="url(#a)">
            <path
              d="M5 16.667V3.333L10 15l5-11.667v13.334"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h20v20H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      fontSize: "large",
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
          <g clip-path="url(#a)">
            <path
              d="M5.833 3.333v13.334h8.334"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h20v20H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      fontSize: "extra-large",
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
          <path
            d="m1.667 3.333 6.666 13.334M8.333 3.333 1.667 16.667M11.667 3.333v13.334h6.666"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      ),
    },
  ];

  //
  let stylesState = useToolStyle((s) => s);

  useEffect(() => {
    stylesState.setStrokeColor(strokeColors[0]);
    stylesState.setBackgroundColor("none");
    stylesState.setFillStyle("fill");
    stylesState.setStrokeStyle("line");
    stylesState.setArrowType("straight");
    stylesState.setEdgeRadius(10);
    stylesState.setStrokeWidth(4);
    stylesState.setOpacity(100);
  }, []);

  let opacityThumbTranslate = stylesState.opacity + "%";

  return (
    <>
      {torender && (
        <div className="bg-bg overflow-hidden rounded-lg">
          <div className="max-h-[80dvh] flex flex-col gap-4 text-xs  p-5 bg-bg-muted ">
            <div className="">
              <div>Stroke</div>
              <div className="flex gap-1 mt-2">
                {strokeColors.map((color) => {
                  return (
                    <div
                      className={
                        stylesState.strokeColor == color
                          ? " rounded-sm border-fg border p-px cursor-pointer"
                          : " rounded-sm p-px cursor-pointer"
                      }
                      onClick={() => {
                        stylesState.setStrokeColor(color);
                      }}
                    >
                      <div
                        className={`w-6 h-6 rounded-sm `}
                        style={{ backgroundColor: color }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
            {(selectedTool == "rect" ||
              selectedTool == "pen" ||
              selectedTool == "line" ||
              selectedTool == "rotrect" ||
              selectedTool == "circle") && (
              <div className="">
                <div>Background</div>
                <div className="flex gap-1 mt-2">
                  <div
                    className={
                      stylesState.backgroundColor == "none"
                        ? " rounded-sm border-fg border p-px cursor-pointer"
                        : " rounded-sm p-px cursor-pointer"
                    }
                  >
                    <div
                      className={"w-6 h-6 rounded-sm "}
                      onClick={() => stylesState.setBackgroundColor("none")}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="checker"
                            width="6"
                            height="6"
                            patternUnits="userSpaceOnUse"
                          >
                            <rect width="6" height="6" fill="#ffffff" />
                            <rect width="3" height="3" fill="#d1d5db" />
                            <rect
                              x="3"
                              y="3"
                              width="3"
                              height="3"
                              fill="#d1d5db"
                            />
                          </pattern>
                        </defs>

                        <rect
                          width="24"
                          height="24"
                          rx="4"
                          fill="url(#checker)"
                        />
                      </svg>
                    </div>
                  </div>
                  {bgColors.map((color) => {
                    return (
                      <div
                        className={
                          color == stylesState.backgroundColor
                            ? " rounded border-fg border p-px"
                            : "rounded-sm p-px"
                        }
                      >
                        <div
                          key={color}
                          className={"w-6 h-6 rounded-sm cursor-pointer"}
                          style={{ backgroundColor: color }}
                          onClick={() => stylesState.setBackgroundColor(color)}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedTool != "arrow" &&
              stylesState.backgroundColor != "none" && (
                <div>
                  <div>Fill</div>
                  <div className="flex gap-2 mt-2">
                    {fillStyles.map((cur) => {
                      return (
                        <div
                          onClick={() => {
                            stylesState.setFillStyle(cur.fillStyle);
                          }}
                          className={
                            stylesState.fillStyle == cur.fillStyle
                              ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                              : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                          }
                        >
                          {" "}
                          <div className="w-4 h-4">{cur.element}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            {selectedTool != "text" && (
              <div>
                <div>Stroke Width</div>
                <div className="flex gap-2 mt-2">
                  {strokeFillWidthStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setStrokeWidth(cur.width);
                        }}
                        className={
                          stylesState.strokeWidth == cur.width
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedTool != "pen" && selectedTool != "text" && (
              <div>
                <div>Stroke Style</div>
                <div className="flex gap-2 mt-2">
                  {strokeStyleStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setStrokeStyle(cur.strokeStyle);
                        }}
                        className={
                          stylesState.strokeStyle == cur.strokeStyle
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedTool == "text" && (
              <div>
                <div>Font Family</div>
                <div className="flex gap-2 mt-2">
                  {fontFamilyStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setFontFamily(cur.fontFamily);
                        }}
                        className={
                          stylesState.fontFamily == cur.fontFamily
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedTool == "text" && (
              <div>
                <div>Font Size</div>
                <div className="flex gap-2 mt-2">
                  {fontSizeStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setFontSize(cur.fontSize);
                        }}
                        className={
                          stylesState.fontSize == cur.fontSize
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedTool == "arrow" && (
              <div>
                <div>Arrow Type</div>
                <div className="flex gap-2 mt-2">
                  {arrowtypeStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setArrowType(cur.arrowType);
                        }}
                        className={
                          stylesState.arrowType == cur.arrowType
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {(selectedTool == "rect" ||
              selectedTool == "rotrect" ||
              selectedTool == "line") && (
              <div>
                <div>Edges</div>
                <div className="flex gap-2 mt-2">
                  {edgesRadiusStyles.map((cur) => {
                    return (
                      <div
                        onClick={() => {
                          stylesState.setEdgeRadius(cur.radius);
                        }}
                        className={
                          stylesState.edgeRadius == cur.radius
                            ? "w-8 h-8 p-1 bg-brand-muted rounded-sm flex items-center justify-center cursor-pointer"
                            : "w-8 h-8 p-1 bg-bg-muted2 rounded-sm flex items-center justify-center cursor-pointer"
                        }
                      >
                        {" "}
                        <div className="w-4 h-4">{cur.element}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <div>Opacity</div>
              <div className="mt-2 relative mb-5">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  onChange={(e) => {
                    stylesState.setOpacity(+e.target.value as opacity);
                  }}
                  value={stylesState.opacity}
                  className="appearance-none bg-bg-muted2 h-2 rounded-full cursor-pointer 
                 [&::-webkit-slider-thumb]:bg-brand 
                 [&::-webkit-slider-thumb]:appearance-none
                 [&::-webkit-slider-thumb]:w-4
                 [&::-webkit-slider-thumb]:h-4
                 [&::-webkit-slider-thumb]:rounded-full
                  [&::-moz-range-thumb]:appearance-none
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-brand w-full"
                ></input>
                <div
                  className={
                    stylesState.opacity == 0
                      ? "hidden"
                      : stylesState.opacity > 50
                        ? `absolute top-5 -translate-x-full`
                        : "absolute top-5 -translate-x-1/2"
                  }
                  style={{ left: opacityThumbTranslate }}
                >
                  {stylesState.opacity}
                </div>
                <div className="absolute top-5">0</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
