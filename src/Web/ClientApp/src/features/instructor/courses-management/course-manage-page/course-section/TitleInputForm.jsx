import { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

function TitleInputForm({ 
  label,
  initialTitle = "",
  showLearningObjectives = false,
  initialLearningObjectives = "",
  onSave, 
  onCancel,
  dragRef,
  dragStyle,
  saveButtonText = "Add",
  paperProps = {}
}) {
  const [title, setTitle] = useState(initialTitle);
  const [learningObjectives, setLearningObjectives] = useState(initialLearningObjectives);

  const handleSave = () => {
    if (title.trim()) {
      const data = { title: title.trim() };
      if (showLearningObjectives) {
        data.learningObjectives = learningObjectives.trim();
      }
      onSave(data);
    }
  };

  return (
    <Paper
      ref={dragRef}
      style={dragStyle}
      sx={{
        mb: 1.5,
        p: 2,
        border: (theme) => `2px solid ${theme.palette.brand.main}`,
        bgcolor: "background.paper",
        boxShadow: 0,
        ...paperProps,
      }}
    >
      <Box>
        {/* Title Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: showLearningObjectives ? 2 : 0 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: "1.1rem",
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            {label}:
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Enter a Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            slotProps={{
              htmlInput: { maxLength: 80 },
              input: {
                endAdornment: (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                  >
                    {title.length}/80
                  </Typography>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                padding: "12px 16px",
                fontSize: "14px",
                "&:hover fieldset": {
                  borderColor: "brand.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "brand.main",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputBase-input": {
                padding: 0,
              },
            }}
          />
        </Box>

        {/* Learning Objectives (Optional) */}
        {showLearningObjectives && (
          <Box sx={{ pl: "136px" }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
              What will students be able to do at the end of this section?
            </Typography>

            <TextField
              fullWidth
              placeholder="Enter a Learning Objective"
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              slotProps={{
                htmlInput: { maxLength: 200 },
                input: {
                  endAdornment: (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                    >
                      {learningObjectives.length}/200
                    </Typography>
                  ),
                },
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  padding: "12px 16px",
                  fontSize: "14px",
                  "&:hover fieldset": {
                    borderColor: "brand.main",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "brand.main",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                },
              }}
            />
          </Box>
        )}

        {/* Buttons Row */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pl: "136px", mt: showLearningObjectives ? 0 : 2 }}>
          <Button
            onClick={onCancel}
            sx={{
              color: "text.primary",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!title.trim()}
            sx={{
              bgcolor: "brand.main",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: "brand.dark",
              },
              "&:disabled": {
                bgcolor: "grey.300",
              },
            }}
          >
            {saveButtonText}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default TitleInputForm;
