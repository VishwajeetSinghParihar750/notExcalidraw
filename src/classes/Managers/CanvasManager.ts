import Collab from "../feature/Collab/Collab";
import ShapeManager from "./ShapeManager";
import ToolManager from "./ToolManager";

export default class CanvasManager {
  private shapeManager: ShapeManager = new ShapeManager();
  private toolManager: ToolManager;
  private collab: Collab | null = null;

  private saveShapeManagerStateLocalStorage: boolean = false;
  private setInvervals: number[] = [];

  private handleMouseDown = (e: MouseEvent) => {
    this.toolManager.onMouseDown(e);
    this.collab?.onMouseDown();
  };
  private handleMouseup = (e: MouseEvent) => {
    this.toolManager.onMouseUp(e);
    this.collab?.onMouseUp();
  };
  private handleMouseMove = (e: MouseEvent) => {
    this.toolManager.onMouseMove(e);
    this.collab?.onMouseMove(e);
  };
  private handleKeyDown = (e: KeyboardEvent) => {
    this.toolManager.onKeyPress(e);
  };

  private saveShapeManagerLocalStorageIfValid = () => {
    if (this.saveShapeManagerStateLocalStorage) {
      this.shapeManager.saveStateLocalStorage();
    }
  };
  private handlePageHide = () => {
    // localStorage.setItem(
    //   "debug_pagehide",
    //   JSON.stringify({
    //     flag: this.saveShapeManagerStateLocalStorage,
    //     shapes: this.shapeManager.shapes,
    //     time: Date.now(),
    //   }),
    // );
    // this.saveShapeManagerLocalStorageIfValid();
    //
    //
    // FUKCEDDDDDDDDDDDDD UPPPPPPPPPPP
    // this is clearing out localstorage on closing window when colab is on, need to check some destructors chain etc, that might be fucking it up, leaving for now
  };

  draw(ctx: CanvasRenderingContext2D) {
    this.shapeManager.draw(ctx);
    this.collab?.draw(ctx);
  }

  private setupEventListeners() {
    document.addEventListener("pointerdown", this.handleMouseDown);
    document.addEventListener("pointerup", this.handleMouseup);
    document.addEventListener("pointermove", this.handleMouseMove);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("pagehide", this.handlePageHide);

    let id = setInterval(() => {
      this.saveShapeManagerLocalStorageIfValid();
    }, 5000);
    this.setInvervals.push(id);
  }
  private removeEventListeners() {
    document.removeEventListener("pointerdown", this.handleMouseDown);
    document.removeEventListener("pointerup", this.handleMouseup);
    document.removeEventListener("pointermove", this.handleMouseMove);
    window.removeEventListener("keydown", this.handleKeyDown);

    this.setInvervals.forEach((id) => clearInterval(id));
  }

  stopCurrentCollab() {
    this.collab?.destructor();
    this.collab = null;

    this.shapeManager.saveStateLocalStorage();
    this.saveShapeManagerStateLocalStorage = true;
  }

  startCollab() {
    if (this.collab) return;

    this.shapeManager.saveStateLocalStorage();
    this.saveShapeManagerStateLocalStorage = false;

    this.collab = new Collab(this.shapeManager);
  }

  constructor(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    editableTextContainerRef: React.RefObject<HTMLDivElement | null>,
  ) {
    this.toolManager = new ToolManager(
      this.shapeManager,
      canvasRef,
      editableTextContainerRef,
    );

    this.setupEventListeners();

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    if (roomId) {
      // try connecting to collab
      this.collab = new Collab(this.shapeManager, roomId);
    } else {
      this.saveShapeManagerStateLocalStorage = true;
      this.shapeManager.loadStateLocalStorage();
    }
  }

  destructor() {
    this.removeEventListeners();

    this.collab?.destructor();
    this.toolManager.destructor();
    this.shapeManager.destructor();
  }
}
