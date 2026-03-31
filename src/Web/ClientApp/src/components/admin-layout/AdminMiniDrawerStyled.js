import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";

const drawerWidth = 280;
const miniWidth = 92;

function openedMixin(theme) {
  return {
    width: drawerWidth,
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    zIndex: 1200,
    height: "100vh",
    background: theme.palette.background.default,
    overflowX: "hidden",
    boxShadow: "none",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen + 200,
    }),
  };
}

function closedMixin(theme) {
  return {
    borderRight: "1px solid",
    borderColor: theme.palette.divider,
    zIndex: 1200,
    height: "100vh",
    background: theme.palette.background.default,
    overflowX: "hidden",
    width: miniWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen + 200,
    }),
  };
}

const AdminMiniDrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : miniWidth,
  borderRight: "0px",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default AdminMiniDrawerStyled;
export { drawerWidth, miniWidth };
