import { useState } from "react";
import {
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

const STATUS_CHIP = {
  embedded: { label: "Embedded", color: "success.darker", bgcolor: "success.lighter" },
  missing: { label: "Missing", color: "warning.dark", bgcolor: "warning.lighter" },
};

function EmbeddingStatusChip({ embedded }) {
  const style = embedded ? STATUS_CHIP.embedded : STATUS_CHIP.missing;
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        height: 24,
        fontSize: "0.72rem",
        fontWeight: 700,
        borderRadius: "6px",
        color: style.color,
        bgcolor: style.bgcolor,
        border: "none",
      }}
    />
  );
}

function UserEmbeddingRow({ user, index, isEmbedded, onEmbed }) {
  const [embedConfirmOpen, setEmbedConfirmOpen] = useState(false);

  const displayName = user.fullName || user.email || user.userId;
  const initials = (user.fullName || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <tr>
        {/* Index */}
        <TableCell sx={{ ...bCell, color: "text.disabled", width: 48, textAlign: "center" }}>
          {index}
        </TableCell>

        {/* User ID */}
        <TableCell sx={{ ...bCell, width: 100 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              color: "text.secondary",
              maxWidth: 90,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
              whiteSpace: "nowrap",
            }}
            title={user.userId}
          >
            #{user.userId?.slice(0, 8)}…
          </Typography>
        </TableCell>

        {/* User info */}
        <TableCell sx={{ ...bCell, py: "10px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: "brand.lighter",
                color: "brand.dark",
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 200 }}>
                {displayName}
              </Typography>
              {user.fullName && user.email && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>

        {/* Embedding Status */}
        <TableCell sx={bCell}>
          <EmbeddingStatusChip embedded={isEmbedded} />
        </TableCell>

        {/* Actions */}
        <TableCell sx={{ ...bCell, textAlign: "right", pr: 1.5 }}>
          <Tooltip title={isEmbedded ? "Re-embed" : "Embed now"}>
            <IconButton
              size="small"
              id={`embed-user-${user.userId}`}
              onClick={() => setEmbedConfirmOpen(true)}
              sx={{ color: "text.secondary", "&:hover": { color: "brand.main" } }}
            >
              <AutoFixHighOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </tr>

      <ConfirmDialog
        open={embedConfirmOpen}
        title={isEmbedded ? "Re-embed User" : "Embed User"}
        message={`Enqueue an embedding job for "${displayName}"? This will ${isEmbedded ? "overwrite the existing vector." : "add this user to the vector store."}`}
        onConfirm={() => { onEmbed(user.userId); setEmbedConfirmOpen(false); }}
        onClose={() => setEmbedConfirmOpen(false)}
      />
    </>
  );
}

export default UserEmbeddingRow;
