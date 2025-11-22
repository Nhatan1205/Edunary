import { 
  Box, 
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

function CourseLearnSidebar({ onClose }) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      
      <Box 
        sx={{ 
          p: 0.75, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          bgcolor: "#fff"
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
          Course Content
        </Typography>
        
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />

      <Box sx={{ flex: 1, overflowY: "auto", p: 0 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Box 
            key={item} 
            sx={{ 
              p: 2, 
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              "&:hover": { bgcolor: "#f7f9fa" }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Section {item}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lesson {item} • 5min
            </Typography>
          </Box>
        ))}
      </Box>
      
    </Box>
  );
}

export default CourseLearnSidebar;