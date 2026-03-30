import { create } from "zustand";
import CanvasManager from "../classes/Managers/CanvasManager";
import { subscribeWithSelector } from "zustand/middleware";
import type { collabState } from "../classes/feature/Collab/Collab";

interface canvasManagerState {
  collabState: collabState;
  roomId: string | null;
  canvasManager: CanvasManager | null;
  setCanvasManager: (manager: CanvasManager | null) => void;
  setCollabState: (state: collabState) => void;
}

const useCanvasManager = create<canvasManagerState>()(
  subscribeWithSelector((set) => ({
    collabState: "closed",
    roomId: null,
    canvasManager: null,
    setCanvasManager: (manager: CanvasManager | null) =>
      set({
        canvasManager: manager,
      }),
    setCollabState: (state: collabState) =>
      set({
        collabState: state,
      }),
    setRoomId: (roomId: string | null) => set({ roomId: roomId }),
  })),
);

export { useCanvasManager };
