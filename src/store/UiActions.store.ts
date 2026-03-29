import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface cursorToolActionsState {
  deleteCurrentSelection: boolean;
  emitDeleteCurrentSelection: () => void;

  duplicateCurrentSelection: boolean;
  emitDuplicateCurrentSelection: () => void;
}

const useCursorToolActions = create<cursorToolActionsState>()(
  subscribeWithSelector((set) => ({
    deleteCurrentSelection: false,
    emitDeleteCurrentSelection: () =>
      set((state) => ({
        deleteCurrentSelection: !state.deleteCurrentSelection,
      })),
    duplicateCurrentSelection: false,
    emitDuplicateCurrentSelection: () =>
      set((state) => ({
        duplicateCurrentSelection: !state.duplicateCurrentSelection,
      })),
  })),
);

interface resetCanvasState {
  resetCanvas: boolean;
  emitResetCanvas: () => void;
}
const useResetCanvas = create<resetCanvasState>()(
  subscribeWithSelector((set) => ({
    resetCanvas: false,
    emitResetCanvas: () =>
      set((state) => ({ resetCanvas: !state.resetCanvas })),
  })),
);

type theme = "dark" | "light";

interface themeState {
  currentTheme: theme;
  setCurrentTheme: (theme: theme) => void;
}

let localStorageTheme = window.localStorage.getItem("theme");
if (localStorageTheme != "light" && localStorageTheme != "dark")
  localStorageTheme = null;
if (localStorageTheme == "dark") document.documentElement.classList.add("dark");

const useTheme = create<themeState>()(
  subscribeWithSelector((set) => ({
    currentTheme: localStorageTheme || "light",
    setCurrentTheme: (newTheme) => {
      set(() => ({ currentTheme: newTheme }));
    },
  })),
);

export { useCursorToolActions, useTheme, useResetCanvas };
export type { theme };
