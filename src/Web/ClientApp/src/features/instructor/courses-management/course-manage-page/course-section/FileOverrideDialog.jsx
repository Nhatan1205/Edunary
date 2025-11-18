import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  // Checkbox,
  // FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo } from "react";

function FileOverrideDialog({ open, fileName, overrideChecked = false, onOverrideChange, onConfirm, onCancel }) {
  const exampleName = useMemo(() => {
    if (!fileName) return "file(1).ext";
    
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) {
      return `${fileName}(1)`;
    }
    const baseName = fileName.substring(0, dotIndex);
    const extension = fileName.substring(dotIndex);
    return `${baseName}(1)${extension}`;
    
  }, [fileName]);
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1.5, minWidth: 400 },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        File Already Exists
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          A file with the name "<strong>{fileName}</strong>" already exists.
          <br /><br />
          Do you want to upload it anyway? It will be saved with a new, unique 
          name (e.g., "<strong>{exampleName}</strong>").
        </DialogContentText>
        
        {/* <FormControlLabel
          control={
            <Checkbox 
              checked={overrideChecked}
              onChange={(e) => onOverrideChange(e.target.checked)}
              sx={{
                color: "brand.main",
                "&.Mui-checked": {
                  color: "brand.main",
                },
              }}
            />
          }
          label="Override existing file"
        /> */}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="text"
          onClick={onCancel}
          sx={{
            color: "text.primary",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "background.muted" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ 
            bgcolor: "brand.main", 
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: "brand.dark" } 
          }}
          onClick={onConfirm}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FileOverrideDialog;
