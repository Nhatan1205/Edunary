import { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router";

import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import AdminHeader from "../components/admin-layout/AdminHeader";
import AdminSidebar from "../components/admin-layout/AdminSidebar";
import AdminDrawerContext from "../components/admin-layout/AdminDrawerContext";
import { drawerWidth, miniWidth } from "../components/admin-layout/AdminMiniDrawerStyled";

const HEADER_HEIGHT = 64;
const TOGGLE_BTN_SIZE = 26;

function AdminLayout() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (downMD) setDrawerOpen(false);
  }, [downMD]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("admin-open-search"));
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarWidth = downMD ? 0 : drawerOpen ? drawerWidth : miniWidth;

  return (
    <AdminDrawerContext.Provider value={{ drawerOpen, toggleDrawer }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <AdminSidebar />

        {/* Fixed header */}
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

        {/* Toggle button — fixed, sits on sidebar border, above everything */}
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
              zIndex: 1300,
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

        {/* Right side — main content */}
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
