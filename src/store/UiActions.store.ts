import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface cursorToolActionsState {
  deleteCurrentSelection: boolean;
  emitDeleteCurrentSelection: () => void;

  duplicateCurrentSelection: boolean;
  emitDuplicateCurrentSelection: () => void;

  resetCanvas: boolean;
  emitResetCanvas: () => void;
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

const useTheme = create<themeState>()(
  subscribeWithSelector((set) => ({
    currentTheme: "dark",
    setCurrentTheme: (newTheme) => {
      set(() => ({ currentTheme: newTheme }));
    },
  })),
);

export { useCursorToolActions, useTheme };
export type { theme };
