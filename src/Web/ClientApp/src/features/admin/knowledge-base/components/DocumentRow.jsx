import { useState } from "react";
import { Box, Typography, TableCell, IconButton, Tooltip, Alert, Chip } from "@mui/material";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const getExt = (fileName) => (fileName || "").split(".").pop().toUpperCase();

const STATUS_COLOR = {
  Pending:    { color: "text.secondary",  bgcolor: "grey.200" },
  Processing: { color: "info.dark",       bgcolor: "info.lighter" },
  Completed:  { color: "success.darker",  bgcolor: "success.lighter" },
  Failed:     { color: "error.dark",      bgcolor: "error.lighter" },
  Deleting:   { color: "warning.dark",    bgcolor: "warning.lighter" },
};

function StatusChip({ status }) {
  const style = STATUS_COLOR[status] ?? STATUS_COLOR.Pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px", color: style.color, bgcolor: style.bgcolor, border: "none" }}
    />
  );
}

const EXT_COLOR = {
  PDF:  { color: "#b71c1c", bgcolor: "#ffebee" },
  DOCX: { color: "#0d47a1", bgcolor: "#e3f2fd" },
  MD:   { color: "#1b5e20", bgcolor: "#e8f5e9" },
};

function TypeChip({ fileName }) {
  const ext = getExt(fileName);
  const style = EXT_COLOR[ext] ?? { color: "text.secondary", bgcolor: "grey.200" };
  return (
    <Chip
      label={ext}
      size="small"
      sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px", color: style.color, bgcolor: style.bgcolor, border: "none" }}
    />
  );
}

const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

function DocumentRow({ doc, index, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <tr>
        {/* Index */}
        <TableCell sx={{ ...bCell, color: "text.disabled", width: 48, textAlign: "center" }}>
          {index}
        </TableCell>

        {/* File */}
        <TableCell sx={{ ...bCell, py: "10px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <InsertDriveFileOutlinedIcon sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 260 }}>
                {doc.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(doc.fileSizeBytes)}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        {/* Type */}
        <TableCell sx={bCell}><TypeChip fileName={doc.fileName} /></TableCell>

        {/* Status */}
        <TableCell sx={bCell}><StatusChip status={doc.status} /></TableCell>

        {/* Chunks */}
        <TableCell sx={bCell}>
          {doc.chunkCount != null ? doc.chunkCount : "—"}
        </TableCell>

        {/* Collection */}
        <TableCell sx={bCell}>
          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
            {doc.qdrantCollection || "—"}
          </Typography>
        </TableCell>

        {/* Uploaded */}
        <TableCell sx={bCell}>{formatDate(doc.created)}</TableCell>

        {/* Actions */}
        <TableCell sx={{ ...bCell, textAlign: "right", pr: 1.5 }}>
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            {doc.fileUrl && (
              <Tooltip title="Open file">
                <IconButton
                  size="small"
                  component="a"
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "text.secondary", "&:hover": { color: "brand.main" } }}
                >
                  <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => setConfirmOpen(true)}
                sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </tr>

      {/* Error inline row */}
      {doc.status === "Failed" && doc.errorMessage && (
        <tr>
          <TableCell colSpan={8} sx={{ pt: 0, pb: 1, borderBottom: "none" }}>
            <Alert severity="error" sx={{ py: 0.5, fontSize: "0.78rem" }}>
              {doc.errorMessage}
            </Alert>
          </TableCell>
        </tr>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${doc.fileName}"? This will also remove its vectors from Qdrant.`}
        onConfirm={() => { onDelete(doc.id); setConfirmOpen(false); }}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default DocumentRow;
