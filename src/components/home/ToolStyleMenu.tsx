import { useEffect } from "react";
import { useTool, useToolStyle } from "../../store/Tools.store";

export default function ToolStyleMenu() {
  let selectedTool = useTool((s) => s.selectedTool);

  let torender =
    selectedTool == "circle" ||
    selectedTool == "rect" ||
    selectedTool == "rotrect" ||
    selectedTool == "line" ||
    selectedTool == "pen" ||
    selectedTool == "aero";

  let strokeColors = ["#d3d3d3", "#ff8383", "#3a994c", "#56a2e8", "#b76100"];
  let bgColors = ["#ff8383", "#3a994c", "#56a2e8", "#b76100"];

  let stylesState = useToolStyle((s) => s);

  useEffect(() => {
    stylesState.setStrokeColor(strokeColors[0]);
    stylesState.setBackgroundColor("null");
  }, []);

  return (
    <>
      {torender && (
        <div className="max-h-[80dvh] flex flex-col gap-4 text-xs  p-5 bg-bg-muted rounded-lg">
          <div className="">
            <div>Stroke</div>
            <div className="flex gap-1 mt-2">
              {strokeColors.map((color) => {
                return (
                  <div
                    className={
                      stylesState.strokeColor == color
                        ? " rounded-sm border-fg border"
                        : " rounded-sm"
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
          <div className="">
            <div>Background</div>
            <div className="flex gap-1 mt-2">
              <div
                className={
                  stylesState.backgroundColor == "null"
                    ? " rounded-sm border-fg border"
                    : " rounded-sm"
                }
              >
                <div
                  className={"w-6 h-6 rounded-sm "}
                  onClick={() => stylesState.setBackgroundColor("null")}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke="red"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="fill-bg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="8" x2="16" y2="16" />
                    <line x1="16" y1="8" x2="8" y2="16" />
                  </svg>
                </div>
              </div>
              {bgColors.map((color) => {
                return (
                  <div
                    className={
                      color == stylesState.backgroundColor
                        ? " rounded-sm border-fg border"
                        : "rounded-sm"
                    }
                  >
                    <div
                      key={color}
                      className={"w-6 h-6 rounded-sm "}
                      style={{ backgroundColor: color }}
                      onClick={() => stylesState.setBackgroundColor(color)}
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
