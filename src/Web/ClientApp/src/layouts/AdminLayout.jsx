import { useState, useCallback, useEffect, useMemo } from "react";
import { Outlet } from "react-router";

import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";

import AdminHeader from "../components/admin-layout/AdminHeader";
import AdminSidebar from "../components/admin-layout/AdminSidebar";
import AdminDrawerContext from "../components/admin-layout/AdminDrawerContext";
import { drawerWidth, miniWidth, HEADER_HEIGHT } from "../components/admin-layout/AdminMiniDrawerStyled";

function AdminLayout() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (downMD) setDrawerOpen(false);
  }, [downMD]);

  const ctxValue = useMemo(
    () => ({ drawerOpen, toggleDrawer, downMD }),
    [drawerOpen, toggleDrawer, downMD]
  );

  const sidebarWidth = downMD ? 0 : drawerOpen ? drawerWidth : miniWidth;

  return (
    <AdminDrawerContext.Provider value={ctxValue}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <AdminSidebar />

        <Box
          component="header"
          sx={{
            position: "fixed",
            top: 0,
            left: sidebarWidth,
            right: 0,
            height: HEADER_HEIGHT,
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            px: 2.5,
            bgcolor: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            transition: "left 0.4s ease",
          }}
        >
          <AdminHeader />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            component="main"
            sx={{
              paddingTop: `${HEADER_HEIGHT + 16}px`,
              px: { xs: 2, md: 2.5 },
              pb: { xs: 2, md: 2.5 },
              minHeight: "100vh",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AdminDrawerContext.Provider>
  );
}

export default AdminLayout;
