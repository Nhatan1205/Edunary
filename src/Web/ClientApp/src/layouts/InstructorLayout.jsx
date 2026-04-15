import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

import InstructorHeader from "../components/instructor-layout/InstructorHeader";
import InstructorSidebar from "../components/instructor-layout/InstructorSidebar";
import MainContentStyled from "../components/instructor-layout/MainContentStyled";
import DrawerContext from "../components/instructor-layout/DrawerContext";

function InstructorLayout() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  // Close drawer on mobile
  useEffect(() => {
    if (downMD) {
      setDrawerOpen(false);
    }
  }, [downMD]);

  return (
    <DrawerContext.Provider value={{ drawerOpen, toggleDrawer }}>
      <Box sx={{ display: "flex" }}>
        {/* header */}
        <AppBar
          enableColorOnDark
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: "background.default" }}
        >
          <Toolbar sx={{ py: 0.5, px: 2, minHeight: "48px !important" }}>
            <InstructorHeader />
          </Toolbar>
        </AppBar>

        {/* sidebar */}
        <InstructorSidebar />

        {/* main content */}
        <MainContentStyled open={drawerOpen}>
          <Box
            sx={{
              minHeight: "calc(100vh - 88px)",
              display: "flex",
              flexDirection: "column",
              py: 2,
            }}
          >
            <Outlet />
          </Box>
        </MainContentStyled>
      </Box>
    </DrawerContext.Provider>
  );
}

export default InstructorLayout;
