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
type strokeWidth = 2 | 4 | 6;
type edgeRadius = 0 | 10;
type opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
type backgroundColor = string | "none";
type strokeColor = string;
type fontFamily = "hand" | "code" | "normal";
type fontSize = "small" | "medium" | "large" | "extra-large";
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
}

const useToolStyle = create<toolStyleState & toolStyleActions>((set) => ({
  strokeColor: "black",
  backgroundColor: "none",
  fillStyle: "fill",
  strokeWidth: 4,
  strokeStyle: "line",
  edgeRadius: 0,
  opacity: 100,
  arrowType: "curve",
  fontFamily: "hand",
  fontSize: "medium",
  textAlign: "left",

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
  fontFamily,
  fontSize,
  textAlign,
};
