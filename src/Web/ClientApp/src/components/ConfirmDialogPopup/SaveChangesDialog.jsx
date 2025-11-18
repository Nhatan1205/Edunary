import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SaveChangesDialog({
  open,
  onClose,
  onSave,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1.5, minWidth: 380 },
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
        Save changes?
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          You have unsaved changes. Do you want to save them before leaving?
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            color: "text.primary",
            "&:hover": { bgcolor: "background.muted" },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          sx={{
            bgcolor: "brand.main",
            "&:hover": { bgcolor: "brand.dark" },
          }}
          onClick={onSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
