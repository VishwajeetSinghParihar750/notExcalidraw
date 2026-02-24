import Menu from "../components/home/Menu";
import Tools from "../components/home/Tools";
import Canvas from "../components/home/Canvas";
import ToolStyleMenu from "../components/home/ToolStyleMenu";

export default function Home() {
  return (
    <>
      <div className="flex justify-between m-5 relative">
        <Menu />
        <Tools />
        <div>{/* for additional stuff */}</div>

        <div className="absolute top-24 overflow-hidden">
          <ToolStyleMenu />
        </div>
        <div className="fixed inset-0 -z-1">
          <Canvas />
        </div>
      </div>
    </>
  );
}
