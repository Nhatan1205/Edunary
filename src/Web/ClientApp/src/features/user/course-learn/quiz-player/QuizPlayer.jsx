import { Box, Typography, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";

function QuizPlayer() {
  const { contentId } = useParams();

  return (
    <Box>
      {/* 1. QUIZ AREA (Giao diện làm bài) */}
      <Box 
        sx={{ 
          p: 5, 
          bgcolor: "#fff", // Nền trắng khác với nền đen của video
          borderBottom: "1px solid #ddd"
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>Quiz: Kiểm tra kiến thức (ID: {contentId})</Typography>
        <Box sx={{ p: 3, bgcolor: "#f7f9fa", border: "1px solid #ccc", mb: 2 }}>
          Câu hỏi 1: React Router dùng để làm gì?
        </Box>
        <Button variant="contained">Submit Quiz</Button>
      </Box>

      {/* 2. TABS AREA (Dùng lại component chung) */}
      <CourseLearnTab />
    </Box>
  );
}

export default QuizPlayer;