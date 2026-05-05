import { Chip } from "@mui/material";

const STATUS_MAP = {
  green: { label: "Ready", color: "success.darker", bgcolor: "success.lighter" },
  yellow: { label: "Optimizing", color: "warning.dark", bgcolor: "warning.lighter" },
  red: { label: "Error", color: "error.dark", bgcolor: "error.lighter" },
};

function StatusChip({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.red;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px", color: s.color, bgcolor: s.bgcolor, border: "none" }}
    />
  );
}

export default StatusChip;
