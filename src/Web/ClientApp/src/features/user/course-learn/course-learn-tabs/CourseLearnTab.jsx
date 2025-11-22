import { Box, Typography } from "@mui/material";

function CourseLearnTab() {
  return (
    <Box sx={{ p: 3, bgcolor: "white", minHeight: "500px" }}>
      {/* Giả lập thanh Tab */}
      <Box sx={{ display: "flex", gap: 3, borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}>
        <Typography sx={{ fontWeight: "bold", color: "black", cursor: "pointer" }}>Overview</Typography>
        <Typography sx={{ color: "#666", cursor: "pointer" }}>Reviews</Typography>
        <Typography sx={{ color: "#666", cursor: "pointer" }}>Notes</Typography>
      </Box>

      {/* Nội dung Tab */}
      <Box sx={{ p: 4, bgcolor: "#f0f2f5", borderRadius: 2 }}>
        <Typography>
          <strong>Tabs Content Area:</strong><br/> 
          Đây là nơi hiển thị Reviews, Overview, Q&A.<br/>
          Nó nằm trong Component <code>CourseFooterTabs</code> và được tái sử dụng.
        </Typography>
      </Box>
    </Box>
  );
}

export default CourseLearnTab;