import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Typography,
} from "@mui/material";

function DeleteCollectionDialog({ open, collectionName, onClose, onConfirm }) {
  const [confirmName, setConfirmName] = useState("");

  const handleClose = () => { setConfirmName(""); onClose(); };
  const handleConfirm = () => { onConfirm(); setConfirmName(""); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>Delete Collection</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
          This permanently deletes <strong>{collectionName}</strong> and all its vectors. Cannot be undone.
        </Alert>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Type <strong>{collectionName}</strong> to confirm:
        </Typography>
        <TextField
          fullWidth size="small" autoFocus
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={collectionName}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: "text.secondary", textTransform: "none" }}>Cancel</Button>
        <Button
          variant="contained" color="error"
          disabled={confirmName !== collectionName}
          onClick={handleConfirm}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
        >
          Delete Forever
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteCollectionDialog;
