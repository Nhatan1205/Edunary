import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".md"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const validate = (file) => {
  if (!file) return "No file selected.";
  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return "Only .pdf, .docx, and .md files are allowed.";
  if (file.size >= MAX_SIZE_BYTES) return "File must be smaller than 10 MB.";
  return "";
};

const addBtnSx = {
  bgcolor: "brand.main",
  color: "#fff",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  borderRadius: "10px",
  px: 2.5,
  py: 1,
  boxShadow: "none",
  "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
};

function UploadDialog({ open, onClose, onUpload, isUploading }) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  const handleFile = (file) => {
    const err = validate(file);
    setValidationError(err);
    setSelectedFile(err ? null : file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        setValidationError("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Upload Document</DialogTitle>
      <DialogContent>
        {/* Drop zone */}
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            const inp = document.getElementById("kb-file-input");
            if (inp) inp.click();
          }}
          sx={{
            border: "2px dashed",
            borderColor: dragging ? "brand.main" : "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: dragging ? "brand.lighter" : "grey.50",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "brand.lighter", borderColor: "brand.main" },
            mb: 2,
          }}
        >
          <input
            id="kb-file-input"
            type="file"
            hidden
            accept=".pdf,.docx,.md"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <UploadFileOutlinedIcon sx={{ fontSize: 44, color: "brand.main", mb: 1 }} />
          <Typography variant="body1" fontWeight={600} color="text.primary">
            {selectedFile ? selectedFile.name : "Drag & drop or click to select"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported: .pdf, .docx, .md — max 10 MB
          </Typography>
          {selectedFile && (
            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
              {formatBytes(selectedFile.size)}
            </Typography>
          )}
        </Box>

        {validationError && <Alert severity="error" sx={{ mb: 1 }}>{validationError}</Alert>}
        {isUploading && <LinearProgress sx={{ borderRadius: 1 }} />}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isUploading} sx={{ color: "text.secondary", textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          sx={{ ...addBtnSx, py: 0.75 }}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UploadDialog;
