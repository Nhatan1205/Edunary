import { useState } from "react";
import { Outlet, useParams } from "react-router";
import { Box, Button, Slide, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CourseLearnHeader from "../features/user/course-learn/course-learn-header/CourseLearnHeader";
import CourseLearnSidebar from "../features/user/course-learn/course-learn-sidebar/CourseLearnSidebar";

function CourseManageLayout() {
  const { courseId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const HEADER_HEIGHT = "64px";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
        <CourseLearnHeader />
      </Box>

      <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
        <Box 
          sx={{ 
            flex: 1, 
            bgcolor: "#1c1d1f",
            position: "relative",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            minHeight: `calc(100vh - ${HEADER_HEIGHT})` 
          }}
        >
          <Outlet /> 
          
          {!isSidebarOpen && (
            <Box 
              sx={{
                position: "absolute", 
                top: "20px",
                right: "0", 
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={() => setIsSidebarOpen(true)}
                sx={{
                  bgcolor: "#2d2f31",
                  color: "white",
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  boxShadow: 3,
                  "&:hover": { bgcolor: "#3e4143" },
                  textTransform: "none",
                  fontWeight: "bold"
                }}
              >
              </Button>
            </Box>
          )}
        </Box>

        <Slide direction="left" in={isSidebarOpen} mountOnEnter unmountOnExit>
          <Box 
            sx={{ 
              width: "350px",
              borderLeft: "1px solid #3e4143",
              bgcolor: "#fff",
              display: "flex", 
              flexDirection: "column",
              
              position: isMobile ? "fixed" : "sticky", 
              top: isMobile ? HEADER_HEIGHT : HEADER_HEIGHT, // Dính ngay dưới Header
              right: 0,
              bottom: 0,
              height: `calc(100vh - ${HEADER_HEIGHT})`, 
              overflowY: "auto", 
              zIndex: 1000
            }}
          >
            <CourseLearnSidebar onClose={() => setIsSidebarOpen(false)} />
          </Box>
        </Slide>

      </Box>
    </Box>
  );
}
export default CourseManageLayout;