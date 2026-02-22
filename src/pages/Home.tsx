import Menu from "../components/home/Menu";
import Tools from "../components/home/Tools";
import ToolStyleMenu from "../components/home/ToolStyleMenu";

export default function Home() {
  return (
    <div className="flex justify-between m-5">
      <Menu />
      <Tools />
      <div>{/* for additional stuff */}</div>

      <div className="absolute top-24 overflow-hidden">
        <ToolStyleMenu />
      </div>
    </div>
  );
}
