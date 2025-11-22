import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";

function VideoPlayer() {
  const { contentId } = useParams();

  return (
    <Box>
      <Box 
        sx={{ 
          width: "100%", 
          height: "450px",
          bgcolor: "black", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "white"
        }}
      >
        <Typography variant="h4">
          VIDEO PLAYER (ID: {contentId})
        </Typography>
      </Box>

      <CourseLearnTab />
    </Box>
  );
}

export default VideoPlayer;