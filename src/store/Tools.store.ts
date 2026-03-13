import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { ShapeType } from "../classes/Shapes/Shape";

type Tool =
  | "cursor"
  | "grab"
  | "rect"
  | "rotrect"
  | "circle"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "eraser";

// for current tool being used
interface toolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;

  reset: () => void;
}
const useTool = create<toolState>()(
  subscribeWithSelector((set) => ({
    selectedTool: "cursor",
    setSelectedTool: (tool) => {
      set(() => ({ selectedTool: tool }));
    },
    reset: () => set(() => ({ selectedTool: "cursor" })),
  })),
);
interface lockedState {
  lockTool: boolean;
  setLockTool: (locktool: boolean) => void;
  reset: () => void;
}

const useLock = create<lockedState>()(
  subscribeWithSelector((set) => ({
    lockTool: false,
    setLockTool: (lock) => {
      set(() => ({ lockTool: lock }));
    },
    reset: () => set({ lockTool: false }),
  })),
);

interface selectedShapesState {
  selectedShapes: Set<ShapeType>;
  setSelectedShapes: (shapes: Set<ShapeType>) => void;
  reset: () => void;
}

const useSelectedShapes = create<selectedShapesState>()(
  subscribeWithSelector((set) => ({
    selectedShapes: new Set(),
    setSelectedShapes: (shapes) => {
      set(() => ({ selectedShapes: shapes }));
    },
    reset: () => set({ selectedShapes: new Set() }),
    
  })),
);

// for tool styling
let darkThemeStrokeColors: string[] = [
  "#d3d3d3",
  "#ff8383",
  "#3a994c",
  "#56a2e8",
  "#b76100",
];
let lightThemeStrokeColors: string[] = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
];

let darkThemeBackgroundColors: string[] = [
  "none",
  "#5b2c2c",
  "#043b0c",
  "#154163",
  "#362500",
];
let lightThemeBackgroundColors: string[] = [
  "none",
  "#ffc9c9",
  "#b2f2bb",
  "#a5d8ff",
  "#ffec99",
];

type fillStyle = "line" | "crosslines" | "fill";
type strokeStyle = "line" | "dotted" | "smalldotted";
type arrowType = "straight" | "curve" | "snake";
type strokeWidth = 2 | 4 | 6;
type edgeRadius = 0 | 10;
type opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
type backgroundColor = 0 | 1 | 2 | 3 | 4; // index
type strokeColor = 0 | 1 | 2 | 3 | 4; // index

type fontFamily = "hand" | "code" | "normal";
type fontSize = "small" | "medium" | "large" | "extra-large" | number;
type textAlign = "left" | "center" | "right";

interface toolStyleState {
  strokeColor: strokeColor; // color
  backgroundColor: backgroundColor;
  fillStyle: fillStyle;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  edgeRadius: edgeRadius;
  opacity: opacity;
  arrowType: arrowType;
  fontFamily: fontFamily;
  fontSize: fontSize;
  textAlign: textAlign;
}

interface toolStyleActions {
  setStrokeColor: (color: strokeColor) => void;
  setBackgroundColor: (color: backgroundColor) => void;
  setFillStyle: (style: fillStyle) => void;
  setStrokeWidth: (width: strokeWidth) => void;
  setStrokeStyle: (style: strokeStyle) => void;
  setEdgeRadius: (radius: edgeRadius) => void;
  setOpacity: (opacity: opacity) => void;
  setArrowType: (type: arrowType) => void;
  setFontFamily: (fontFamily: fontFamily) => void;
  setFontSize: (fontSize: fontSize) => void;
  setTextAlign: (textAlign: textAlign) => void;
  reset: () => void;
}

let toolStyleInitalState: toolStyleState = {
  strokeColor: 0,
  backgroundColor: 0,
  fillStyle: "fill",
  strokeWidth: 4,
  strokeStyle: "line",
  edgeRadius: 0,
  opacity: 100,
  arrowType: "curve",
  fontFamily: "hand",
  fontSize: "medium",
  textAlign: "left",
};
const useToolStyle = create<toolStyleState & toolStyleActions>()(
  subscribeWithSelector((set) => ({
    ...toolStyleInitalState,

    setStrokeColor: (color) => set({ strokeColor: color }),
    setBackgroundColor: (color) => set({ backgroundColor: color }),
    setFillStyle: (style) => set({ fillStyle: style }),
    setStrokeWidth: (width) => set({ strokeWidth: width }),
    setStrokeStyle: (style) => set({ strokeStyle: style }),
    setEdgeRadius: (radius) => set({ edgeRadius: radius }),
    setOpacity: (opacity) => set({ opacity }),
    setArrowType: (type) => set({ arrowType: type }),
    setFontFamily: (fontFamily) => set({ fontFamily: fontFamily }),
    setFontSize: (fontSize) => set({ fontSize: fontSize }),
    setTextAlign: (textAlign) => set({ textAlign: textAlign }),

    reset: () => set(toolStyleInitalState),
  })),
);

export { useTool, useLock, useToolStyle, useSelectedShapes };
export type {
  Tool,
  fillStyle,
  strokeStyle,
  arrowType,
  strokeWidth,
  edgeRadius,
  opacity,
  backgroundColor,
  strokeColor,
  fontFamily,
  fontSize,
  textAlign,
};
export {
  darkThemeBackgroundColors,
  lightThemeBackgroundColors,
  darkThemeStrokeColors,
  lightThemeStrokeColors,
};
