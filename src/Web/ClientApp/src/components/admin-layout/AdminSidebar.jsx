import { memo, useMemo } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Lightbulb } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";
import Link from "@mui/material/Link";

import AdminMenuList from "./AdminMenuList";
import AdminMiniDrawerStyled, { drawerWidth } from "./AdminMiniDrawerStyled";
import { useAdminDrawer } from "./AdminDrawerContext";

function AdminSidebar() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { drawerOpen, toggleDrawer } = useAdminDrawer();

  // Logo row — no toggle button here, it lives in AdminLayout
  const logo = useMemo(
    () => (
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
    ),
    [drawerOpen]

  );


  const menuContent = useMemo(() => (
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
  ), [drawerOpen]);

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {logo}
      {menuContent}
    </Box>
  );


  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        width: { xs: "auto", md: drawerOpen ? drawerWidth : 72 },
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
    </Box>
  );
}

export default memo(AdminSidebar);
