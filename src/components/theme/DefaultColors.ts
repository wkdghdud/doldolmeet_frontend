import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const themes = () => {
  return createTheme({
    direction: "ltr",
    palette: {
      primary: {
        main: "#ff8fab",
        light: "#ECF2FF",
        dark: "#fb6f92",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#FFC8DD",
        light: "#E8F7FF",
        dark: "#e7b6c8",
        contrastText: "#ffffff",
      },
      success: {
        main: "#CDB4DB",
        light: "#E6FFFA",
        dark: "#af9abb",
        contrastText: "#ffffff",
      },
      info: {
        main: "#A2D2FF",
        light: "#EBF3FE",
        dark: "#8bb3d9",
        contrastText: "#ffffff",
      },
      error: {
        main: "#FA896B",
        light: "#FDEDE8",
        dark: "#f3704d",
        contrastText: "#ffffff",
      },
      warning: {
        main: "#FFAE1F",
        light: "#FEF5E5",
        dark: "#ae8e59",
        contrastText: "#ffffff",
      },
      grey: {
        100: "#F2F6FA",
        200: "#EAEFF4",
        300: "#DFE5EF",
        400: "#7C8FAC",
        500: "#5A6A85",
        600: "#2A3547",
      },
      text: {
        primary: "#2A3547",
        secondary: "#5A6A85",
      },
      action: {
        disabledBackground: "rgba(73,82,88,0.12)",
        hoverOpacity: 0.02,
        hover: "#f6f9fc",
      },
      divider: "#e5eaef",
    },
    typography,
    shadows,
  });
};

export default themes;
