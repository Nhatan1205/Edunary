import { Box, Button, Typography } from "@mui/material";
import FileUploadTable from "./FileUploadTable";

function FileUploadSection({
  fileInfo,
  onFileChange,
  acceptFileType = "*/*",
  maxSizeMB = 1024,
  noteText,
  buttonLabel = "Select File"
}) {
  return (
    <Box>
      {!fileInfo && (
        <>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "text.secondary",
                  fontSize: "0.875rem"
                }}
              >
                No file selected
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              component="label"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "brand.main",
                borderColor: "brand.main",
                px: 2,
                whiteSpace: "nowrap",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
            >
              {buttonLabel}
              <input
                type="file"
                hidden
                accept={acceptFileType}
                onChange={onFileChange}
              />
            </Button>
          </Box>

          {noteText && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: "block",
                color: "text.secondary",
                fontSize: "0.75rem",
                mb: 2,
              }}
            >
              {noteText}
            </Typography>
          )}
        </>
      )}

      <FileUploadTable fileInfo={fileInfo} />
    </Box>
  );
}

export default FileUploadSection;
