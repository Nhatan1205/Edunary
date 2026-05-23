import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Slide, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoadingSpinner from "../../../../components/LoadingSpinner";
import PreviewCourseLearnHeader from "./components/PreviewCourseLearnHeader";
import PreviewCourseLearnSidebar from "./components/PreviewCourseLearnSidebar";
import PreviewCourseContent from "./components/PreviewCourseContent";

export default function InstructorCoursePreviewPage() {
  const { courseId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [courseContents, setCourseContents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const channel = new BroadcastChannel(`preview_channel_${courseId}`);

    channel.onmessage = (event) => {
      if (event.data.type === 'SEND_DATA') {
        const sections = event.data.payload;
        console.log("data: ", sections);
        setCourseContents(sections);
        setIsLoading(false);
        if (sections.length > 0) {
          setExpandedSections({ [sections[0].sectionId]: true });
          if (sections[0].items && sections[0].items.length > 0) {
            setSelectedItem(sections[0].items[0]);
          }
        }
      }
    };

    // Request data from the builder tab
    channel.postMessage({ type: 'REQUEST_DATA' });

    return () => {
      channel.close();
    };
  }, [courseId]);



  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (isMobile) setIsSidebarOpen(false);
  };

  if (isLoading) {
    return <Box className="d-flex justify-content-center align-items-center vh-100"><LoadingSpinner /></Box>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
        <PreviewCourseLearnHeader
          courseTitle="Course Preview"
          courseContents={courseContents}
        />
      </Box>

      {/* Body */}
      <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
        <Box sx={{ flex: 1, bgcolor: "#1c1d1f", position: "relative", transition: "all 0.3s ease", display: "flex", flexDirection: "column", minHeight: `calc(100vh - 72px)` }}>
          <PreviewCourseContent selectedItem={selectedItem} courseId={courseId} />

          {!isSidebarOpen && (
            <Box sx={{ position: "absolute", top: "20px", right: "0", zIndex: 10 }}>
              <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => setIsSidebarOpen(true)} sx={{ bgcolor: "#2d2f31", color: "white", borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: 3, "&:hover": { bgcolor: "#3e4143" } }} />
            </Box>
          )}
        </Box>

        <Slide direction="left" in={isSidebarOpen} mountOnEnter unmountOnExit>
          <Box sx={{ width: "350px", borderLeft: "1px solid #3e4143", bgcolor: "#fff", display: "flex", flexDirection: "column", position: isMobile ? "fixed" : "sticky", top: { xs: "64px", md: "72px" }, right: 0, bottom: 0, height: `calc(100vh - 72px)`, overflowY: "auto", zIndex: 1000 }}>
            <PreviewCourseLearnSidebar
              onClose={() => setIsSidebarOpen(false)}
              courseContents={courseContents}
              expandedSections={expandedSections}
              handleSectionToggle={handleSectionToggle}
              selectedItem={selectedItem}
              handleItemClick={handleItemClick}
            />
          </Box>
        </Slide>
      </Box>
    </Box>
  );
}