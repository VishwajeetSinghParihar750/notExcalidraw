import {
  darkThemeBackgroundColors,
  lightThemeBackgroundColors,
  darkThemeStrokeColors,
  lightThemeStrokeColors,
} from "../store/Tools.store";
import type { backgroundColor, strokeColor } from "../store/Tools.store";
import { useTheme } from "../store/UiActions.store";

export function getBackgroundColorString(index: backgroundColor) {
  let theme = useTheme.getState().currentTheme;
  if (theme == "dark") return darkThemeBackgroundColors[index];
  else if (theme == "light") return lightThemeBackgroundColors[index];

  return "";
}

export function getStrokeColorString(index: strokeColor) {
  let theme = useTheme.getState().currentTheme;
  if (theme == "dark") return darkThemeStrokeColors[index];
  else if (theme == "light") return lightThemeStrokeColors[index];

  return "";
}
