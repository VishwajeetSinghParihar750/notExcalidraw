import Collab from "../feature/Collab/Collab";
import ShapeManager from "./ShapeManager";
import ToolManager from "./ToolManager";

export default class CanvasManager {
  private shapeManger: ShapeManager = new ShapeManager();
  private toolManager: ToolManager;
  private collab: Collab | null = null;

  private handleMouseDown = (e: MouseEvent) => {
    this.toolManager.onMouseDown(e);
    this.collab?.onMouseDown(e);
  };
  private handleMouseup = (e: MouseEvent) => {
    this.toolManager.onMouseUp(e);
    this.collab?.onMouseUp(e);
  };
  private handleMouseMove = (e: MouseEvent) => {
    this.toolManager.onMouseMove(e);
    this.collab?.onMouseMove(e);
  };
  private handleKeyDown = (e: KeyboardEvent) => {
    this.toolManager.onKeyPress(e);
  };

  draw(ctx: CanvasRenderingContext2D) {
    for (let shape of Object.values(this.shapeManger.shapes)) {
      shape.draw(ctx);
    }
    this.collab?.draw(ctx);
  }

  private setupEventListeners() {
    document.addEventListener("pointerdown", this.handleMouseDown);
    document.addEventListener("pointerup", this.handleMouseup);
    document.addEventListener("pointermove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
  }
  private removeEventListeners() {
    document.removeEventListener("pointerdown", this.handleMouseDown);
    document.removeEventListener("pointerup", this.handleMouseup);
    document.removeEventListener("pointermove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  stopCurrentCollab() {
    this.collab?.destructor();
    this.collab = null;
    return;
  }
  startCollab() {
    if (this.collab) return;
    this.collab = new Collab(this.shapeManger);
  }
  constructor(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    editableTextContainerRef: React.RefObject<HTMLDivElement | null>,
  ) {
    this.toolManager = new ToolManager(
      this.shapeManger,
      canvasRef,
      editableTextContainerRef,
    );

    this.setupEventListeners();

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    console.log(roomId);
    if (roomId) {
      // try connecting to collab
      this.collab = new Collab(this.shapeManger, roomId);
    }
  }

  destructor() {
    this.removeEventListeners();

    this.collab?.destructor();
    this.toolManager.destructor();
    this.shapeManger.destructor();
  }
}
