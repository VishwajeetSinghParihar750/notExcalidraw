import { create } from "zustand";

//

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
}

const useTool = create<toolState>((set) => ({
  selectedTool: "rect",
  setSelectedTool: (tool) => {
    set(() => ({ selectedTool: tool }));
  },
}));

// for tool styling

type fillStyle = "line" | "crosslines" | "fill";
type strokeStyle = "line" | "dotted" | "smalldotted";
type arrowType = "straight" | "curve" | "snake";
type strokeWidth = 1 | 2 | 3;
type edgeRadius = 0 | 10;
type opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
type backgroundColor = string;
type strokeColor = string;

interface toolStyleState {
  strokeColor: strokeColor; // color
  backgroundColor: backgroundColor;
  fillStyle: fillStyle;
  strokeWidth: strokeWidth;
  strokeStyle: strokeStyle;
  edgeRadius: edgeRadius;
  opacity: opacity;
  arrowType: arrowType;
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
}

const useToolStyle = create<toolStyleState & toolStyleActions>((set) => ({
  strokeColor: "black",
  backgroundColor: "white",
  fillStyle: "fill",
  strokeWidth: 2,
  strokeStyle: "line",
  edgeRadius: 0,
  opacity: 100,
  arrowType: "curve",

  setStrokeColor: (color) => set({ strokeColor: color }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setFillStyle: (style) => set({ fillStyle: style }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeStyle: (style) => set({ strokeStyle: style }),
  setEdgeRadius: (radius) => set({ edgeRadius: radius }),
  setOpacity: (opacity) => set({ opacity }),
  setArrowType: (type) => set({ arrowType: type }),
}));

export { useTool, useToolStyle };
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
};
