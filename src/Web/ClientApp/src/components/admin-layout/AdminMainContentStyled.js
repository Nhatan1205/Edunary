import { styled } from "@mui/material/styles";

const drawerWidth = 280;
const miniWidth = 72;
const headerHeight = 64;

const AdminMainContentStyled = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backgroundColor: theme.palette.background.alt || theme.palette.grey[100],
  minWidth: "1%",
  width: "100%",
  minHeight: `calc(100vh - ${headerHeight}px)`,
  flexGrow: 1,
  padding: 20,
  marginTop: headerHeight,
  borderRadius: "12px",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  ...(!open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter + 200,
    }),
    [theme.breakpoints.up("md")]: {
      marginLeft: -(drawerWidth - miniWidth),
      width: `calc(100% - ${drawerWidth}px)`,
    },
  }),
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter + 200,
    }),
    marginLeft: 0,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
  [theme.breakpoints.down("md")]: {
    marginLeft: 20,
    padding: 16,
    ...(!open && {
      width: `calc(100% - ${drawerWidth}px)`,
    }),
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: 10,
    marginRight: 10,
  },
}));

export default AdminMainContentStyled;
