import { memo } from "react";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Lightbulb } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink } from "react-router";
import Link from "@mui/material/Link";

import AdminMenuList from "./AdminMenuList";
import AdminMiniDrawerStyled, { drawerWidth, miniWidth, HEADER_HEIGHT } from "./AdminMiniDrawerStyled";
import { useAdminDrawer } from "./AdminDrawerContext";

const TOGGLE_BTN_SIZE = 26;

function AdminSidebar() {
  const { drawerOpen, toggleDrawer, downMD } = useAdminDrawer();

  const logo = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: drawerOpen ? "flex-start" : "center",
        px: drawerOpen ? 2.5 : 1,
        minHeight: 64,
      }}
    >
      <Link
        component={RouterLink}
        to="/"
        aria-label="logo"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Lightbulb sx={{ color: "brand.main", width: 30, height: 30, flexShrink: 0 }} />
        {drawerOpen && (
          <Typography
            variant="h4"
            sx={{ fontSize: "22px", fontWeight: "bold", color: "brand.main" }}
          >
            Edunary
          </Typography>
        )}
      </Link>
    </Box>
  );

  const menuContent = (
    <Box
      sx={{
        px: drawerOpen ? "16px" : "8px",
        flexGrow: 1,
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { borderRadius: 4, bgcolor: "divider" },
      }}
    >
      <AdminMenuList />
    </Box>
  );

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {logo}
      {menuContent}
    </Box>
  );

  const sidebarWidth = downMD ? 0 : drawerOpen ? drawerWidth : miniWidth;

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        width: { xs: "auto", md: drawerOpen ? drawerWidth : miniWidth },
        transition: "width 0.4s ease",
      }}
      aria-label="admin sidebar navigation"
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
                bgcolor: "background.default",
                borderRight: "none",
              },
            },
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <AdminMiniDrawerStyled variant="permanent" open={drawerOpen}>
          {sidebarContent}
        </AdminMiniDrawerStyled>
      )}

      {!downMD && (
        <IconButton
          onClick={toggleDrawer}
          size="small"
          sx={{
            position: "fixed",
            top: (HEADER_HEIGHT - TOGGLE_BTN_SIZE) / 2,
            left: sidebarWidth - TOGGLE_BTN_SIZE / 2,
            width: TOGGLE_BTN_SIZE,
            height: TOGGLE_BTN_SIZE,
            zIndex: 1200,
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.tertiary",
            boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
            transition: "left 0.4s ease",
            "&:hover": {
              bgcolor: "background.muted",
              color: "text.primary",
            },
          }}
        >
          {drawerOpen
            ? <ChevronLeftIcon sx={{ fontSize: 16 }} />
            : <ChevronRightIcon sx={{ fontSize: 16 }} />
          }
        </IconButton>
      )}
    </Box>
  );
}

export default memo(AdminSidebar);
