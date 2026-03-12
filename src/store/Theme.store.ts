import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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

export { useTheme };
export type { theme };
