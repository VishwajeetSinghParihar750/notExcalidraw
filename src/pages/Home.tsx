import Menu from "../components/home/Menu";
import Tools from "../components/home/Tools";
import Canvas from "../components/home/Canvas";
import ToolStyleMenu from "../components/home/ToolStyleMenu";
import { useRef } from "react";

export default function Home() {
  let editableTextContainer = useRef<HTMLDivElement>(null);
  return (
    <div className="fixed inset-0 bg-bg text-fg ">
      <div className="absolute left-5 top-5">
        <Menu />
      </div>
      <div className="absolute top-5 left-1/2 -translate-x-1/2">
        <Tools />
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
