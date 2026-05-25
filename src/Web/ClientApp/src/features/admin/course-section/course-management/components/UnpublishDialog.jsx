import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function UnpublishDialog({ open, onClose, onConfirm, courseTitle, isSubmitting }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters long.");
      return;
    }
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <WarningAmberIcon color="error" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Unpublish Course
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Are you sure you want to unpublish <strong>{courseTitle}</strong>? This will remove the course from the marketplace immediately. Existing enrolled students will still retain access.
        </Typography>

        <Box sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Reason for Unpublishing"
            placeholder="Describe why this course is being unpublished (e.g. outdated content, policy violation)..."
            multiline
            rows={4}
            fullWidth
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim().length >= 10) {
                setError("");
              }
            }}
            error={!!error}
            helperText={error || "Minimum 10 characters."}
            disabled={isSubmitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting} variant="outlined" sx={{ borderRadius: "8px" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          color="error"
          sx={{ borderRadius: "8px" }}
        >
          {isSubmitting ? "Unpublishing..." : "Unpublish Course"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
