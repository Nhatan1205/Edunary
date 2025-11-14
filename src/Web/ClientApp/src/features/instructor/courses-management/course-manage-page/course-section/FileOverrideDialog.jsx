import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function FileOverrideDialog({ open, fileName, overrideChecked, onOverrideChange, onConfirm, onCancel }) {
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
          A file with the name "{fileName}" already exists. Do you want to replace it?
        </DialogContentText>
        
        <FormControlLabel
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
        />
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
