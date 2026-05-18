import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PreviewVideoPlayer from "../../../../guest/course-overview/components/PreviewVideoPlayer";
import PreviewCourseLearnTab from "./PreviewCourseLearnTab";
import PreviewQuizPlayer from "./PreviewQuizPlayer";
import PreviewAssignmentPlayer from "./assignment/PreviewAssignmentPlayer";

export default function PreviewCourseContent({ selectedItem, courseId }) {
  if (!selectedItem) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "text.secondary" }}>
        <Typography variant="h6">Select an item from the curriculum to preview</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#1c1d1f" }}>
      {(selectedItem.contentType === 'video' || selectedItem.type === 'video') && selectedItem.videoId ? (
        <Box sx={{ width: "100%", bgcolor: "black", display: "flex", justifyContent: "center" }}>
          <PreviewVideoPlayer contentId={selectedItem.videoId} onEnded={() => {}} />
        </Box>
      ) : (selectedItem.contentType === 'quiz' || selectedItem.type === 'quiz') ? (
        <Box sx={{ width: "100%", bgcolor: "#fff", display: "flex", justifyContent: "center", flex: 1, minHeight: 0 }}>
          <PreviewQuizPlayer courseId={courseId} contentId={selectedItem.itemId} />
        </Box>
      ) : (selectedItem.contentType === 'assignment' || selectedItem.type === 'assignment') ? (
        <Box sx={{ width: "100%", bgcolor: "#fff", display: "flex", justifyContent: "center", flex: 1, minHeight: 0 }}>
          <PreviewAssignmentPlayer courseId={courseId} contentId={selectedItem.itemId} />
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%',
          flex: 1,
          bgcolor: '#fff',
          color: '#000',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {selectedItem.title}
            </Typography>
            
            <Box 
              sx={{ 
                fontSize: '1.1rem',
                lineHeight: 1.8,
                '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 2 },
                '& p': { mb: 2 },
                '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 4, mb: 2, fontWeight: 600 }
              }}
              dangerouslySetInnerHTML={{ __html: selectedItem.content }} 
            />
          </Container>
        </Box>
      )}

      {/* Tabs at the bottom */}
      <Box sx={{ bgcolor: "background.default" }}>
        <PreviewCourseLearnTab />
      </Box>
    </Box>
  );
}