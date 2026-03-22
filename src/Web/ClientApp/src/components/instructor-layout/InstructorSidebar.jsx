import { memo, useMemo } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Lightbulb } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

import InstructorMenuList from "./InstructorMenuList";
import MiniDrawerStyled from "./MiniDrawerStyled";
import { useDrawer } from "./DrawerContext";

const drawerWidth = 260;

function InstructorSidebar() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { drawerOpen, toggleDrawer } = useDrawer();

  const logo = useMemo(
    () => (
      <Box sx={{ display: "flex", p: 2, alignItems: "center" }}>
        <Link
          component={RouterLink}
          to="/"
          aria-label="logo"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            gap: 1,
          }}
        >
          <Lightbulb
            sx={{
              color: "brand.main",
              width: 30,
              height: 30,
            }}
          />
          {drawerOpen && (
            <Typography
              variant="h3"
              sx={{
                color: "text.primary",
                fontWeight: 700,
              }}
            >
              Edunary
            </Typography>
          )}
        </Link>
      </Box>
    ),
    [drawerOpen]
  );

  const drawer = useMemo(() => {
    let drawerSX = {
      paddingLeft: "0px",
      paddingRight: "0px",
      marginTop: "20px",
    };
    if (drawerOpen)
      drawerSX = {
        paddingLeft: "16px",
        paddingRight: "16px",
        marginTop: "0px",
      };

    return (
      <Box
        sx={{
          ...drawerSX,
          height: downMD ? "auto" : "calc(100vh - 90px)",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: 5,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 4,
            bgcolor: "divider",
          },
        }}
      >
        <InstructorMenuList />
      </Box>
    );
  }, [downMD, drawerOpen]);

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        width: { xs: "auto", md: drawerWidth },
      }}
      aria-label="sidebar navigation"
    >
      {downMD ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          slotProps={{
            paper: {
              sx: {
                width: drawerWidth,
                bgcolor: "background.muted",
                borderRight: "none",
              },
            },
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
          {logo}
          {drawer}
        </Drawer>
      ) : (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {logo}
          {drawer}
        </MiniDrawerStyled>
      )}
    </Box>
  );
}

export default memo(InstructorSidebar);
