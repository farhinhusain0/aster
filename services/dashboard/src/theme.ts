import { extendTheme } from "@mui/joy";

export const asterTheme = extendTheme({
  typography: {
    "body-sm": {
      color: "var(--joy-palette-text-primary)",
      fontSize: "14px",
      lineHeight: "20px",
    },
    "title-sm": {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 500,
    },
  },
  colorSchemes: {
    light: {
      palette: {
        text: {
          primary: "#121417",
        },
      },
    },
  },
});
