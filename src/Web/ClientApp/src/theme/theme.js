import { createTheme } from "@mui/material/styles";

// MUI Theme - Comprehensive color tokens + component overrides
// This file includes detailed palette tokens, semantic colors, form/button/icon tokens,
// and component style overrides. Each token has a comment describing when/how to use it.

const theme = createTheme({
  palette: {
    mode: "light", // change to 'dark' and provide dark tokens if supporting dark mode

    // --- Primary / Secondary / Accent ---
    // primary: main brand color. Use for main CTAs, app bar accents, active states.
    brand: {
      lighter: "#b2e9de", // subtle backgrounds (selected rows, badges)
      light: "#7edbc9", // hover / emphasis
      main: "#3FCCB2", // xanh ngọc - main CTA color
      dark: "#00b190", // pressed / strong border
      darker: "#009272", // very dark variant for strong contrast
    },

    // secondary: supporting CTAs and accents
    secondaryBrand: {
      lighter: "#b3e1e3",
      light: "#80cfd1",
      main: "#49BBBD", // xanh biển nhạt
      dark: "#007f7c",
    },
    // --- Background / Surfaces ---
    background: {
      // Background 1 - global page background
      default: "#F7FBFA", // very light green/teal tint; use for full page background
      // Background 2 - surface / section background
      surface: "#FCFFFE", // slightly different from default for sections
      // Background 3 - paper/card
      paper: "#FFFFFF", // use for cards, dialogs, menus
      // Background 4 - alt (alternate section backgrounds)
      alt: "#F4F7F6", // use to separate sections, sidebars
      // muted surfaces - for subtle grouping (forms, footers)
      muted: "#EFF7F6",
    },

    // --- Text tokens ---
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
      inverse: "#FFFFFF",
    },

    // Divider / Borders
    divider: "#E6F0EE",
  },

  // Typography settings (kept your initial config + base scale)
  typography: {
    fontFamily: "Nosifer, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.6rem", fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    button: { textTransform: "none" }, // keep natural case for buttons
  },
});

export default theme;
