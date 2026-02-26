import Menu from "../components/home/Menu";
import Tools from "../components/home/Tools";
import Canvas from "../components/home/Canvas";
import ToolStyleMenu from "../components/home/ToolStyleMenu";

export default function Home() {
  return (
    <body className="bg-bg text-fg w-full h-full">
      <div
        className="flex justify-between m-5 z-0 relative "
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Menu />
        <Tools />
        <div>{/* for additional stuff */}</div>

        <div className="absolute top-24 overflow-hidden z-0">
          <ToolStyleMenu />
        </div>
      </div>
      <div className="fixed inset-0 -z-1">
        <Canvas />
      </div>
    </body>
  );
}
