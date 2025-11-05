import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    brand: {
      lighter: "#E9FAF7",
      light: "#7edbc9",
      main: "#3FCCB2",
      dark: "#00b190",
      darker: "#009272",
    },

    secondaryBrand: {
      lighter: "#b3e1e3",
      light: "#80cfd1",
      main: "#49BBBD",
      dark: "#007f7c",
    },

    background: {
      // Background 1 - global page background
      default: "#FFFFFF", // very light green/teal tint; use for full page background
      // Background 2 - surface / section background
      surface: "#FCFFFE", // slightly different from default for sections
      // Background 3 - paper/card
      paper: "#FFFFFF", // use for cards, dialogs, menus
      // Background 4 - alt (alternate section backgrounds)
      alt: "#F4F7F6", // use to separate sections, sidebars
      // muted surfaces - for subtle grouping (forms, footers)
      muted: "#EFF7F6",
    },

    text: {
      // Text 1 - primary copy
      primary: "#0F2B2A", // high contrast for body and headings
      // Text 2 - secondary metadata / labels
      secondary: "#2F6D6A",
      // Tertiary / helper text
      tertiary: "#5C8683",
      // Muted / placeholder
      disabled: "#9CB8B6",
      // Inverse text for colored backgrounds
      inverse: "#F7FBFA",
    },

    divider: "#bebebeff",
  },

  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.6rem", fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    button: { textTransform: "none" },
  },
});

export default theme;
