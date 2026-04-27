import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    brand: {
      lighter: "#C8FAD6",
      light: "#5BE49B",
      main: "#00A76F",
      dark: "#007867",
      darker: "#004B50",
    },

    primary: {
      lighter: "#C8FAD6",
      light: "#5BE49B",
      main: "#00A76F",
      dark: "#007867",
      darker: "#004B50",
      contrastText: "#FFFFFF",
    },

    secondaryBrand: {
      lighter: "#EBD6FD",
      light: "#C684FF",
      main: "#8E33FF",
      dark: "#5119B7",
      darker: "#27097A",
    },

    success: {
      lighter: "#D3FCD2",
      light: "#77ED8B",
      main: "#22C55E",
      dark: "#118D57",
      darker: "#065E49",
      contrastText: "#FFFFFF",
    },

    info: {
      lighter: "#D0F2FF",
      light: "#74CAFF",
      main: "#1890FF",
      dark: "#0C53B7",
      darker: "#04297A",
      contrastText: "#FFFFFF",
    },

    warning: {
      lighter: "#FFF7CD",
      light: "#FFE16A",
      main: "#FFC107",
      dark: "#B78103",
      darker: "#7A4F01",
      contrastText: "#1C252E",
    },

    error: {
      lighter: "#FFE9E9",
      light: "#FF7A7A",
      main: "#FF3B3B",
      dark: "#B71D18",
      darker: "#7A0916",
      contrastText: "#FFFFFF",
    },

    grey: {
      0: "#FFFFFF",
      100: "#F9FAFB",
      200: "#F4F6F8",
      300: "#DFE3E8",
      400: "#C4CDD5",
      500: "#919EAB",
      600: "#637381",
      700: "#454F5B",
      800: "#212B36",
      900: "#161C24",
    },

    background: {
      default: "#FFFFFF",
      surface: "#FCFFFE",
      paper: "#FFFFFF",
      alt: "#fbf9fa",
      muted: "#eff7f0ff",
    },

    text: {
      primary: "#1C252E",
      secondary: "#637381",
      tertiary: "#5c8662ff",
      disabled: "#9CB8B6",
      inverse: "#F7FBFA",
    },

    divider: "#E0E0E0",
  },

  typography: {
    fontFamily: "Public Sans Variable, Roboto, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.6rem", fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    button: { textTransform: "none" },
  },
});

export default theme;