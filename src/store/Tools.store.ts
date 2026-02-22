import { create } from "zustand";

//

type Tool =
  | "cursor"
  | "grab"
  | "rect"
  | "rotrect"
  | "circle"
  | "aero"
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
type arrowTypes = "straight" | "curve" | "snake";
interface toolStyleState {
  strokeColor: string; // color
  backgroundColor: string;
  fillStyle: fillStyle;
  strokeWidth: number;
  strokeStyle: strokeStyle;
  edgeRadius: number;
  opacity: number;
  arrowTypes: arrowTypes;
}

interface toolStyleActions {
  setStrokeColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setFillStyle: (style: fillStyle) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeStyle: (style: strokeStyle) => void;
  setEdgeRadius: (radius: number) => void;
  setOpacity: (opacity: number) => void;
  setArrowTypes: (type: arrowTypes) => void;
}

const useToolStyle = create<toolStyleState & toolStyleActions>((set) => ({
  strokeColor: "black",
  backgroundColor: "white",
  fillStyle: "fill",
  strokeWidth: 2,
  strokeStyle: "line",
  edgeRadius: 0,
  opacity: 100,
  arrowTypes: "curve",

  setStrokeColor: (color) => set({ strokeColor: color }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setFillStyle: (style) => set({ fillStyle: style }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeStyle: (style) => set({ strokeStyle: style }),
  setEdgeRadius: (radius) => set({ edgeRadius: radius }),
  setOpacity: (opacity) => set({ opacity }),
  setArrowTypes: (type) => set({ arrowTypes: type }),
}));

export { useTool, useToolStyle };
export type { Tool, fillStyle, strokeStyle, arrowTypes };
