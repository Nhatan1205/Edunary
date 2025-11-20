import { Chip } from "@mui/material";

function MetaChip({
  icon = null,
  label,
  backgroundColor = "#fff",
  color = "#595C73",
  borderColor = "#ddd"
}) {
  return (
    <Chip
      icon={icon}
      label={label}
      variant="outlined"
      sx={{
        backgroundColor: backgroundColor,
        color: color,
        borderColor: borderColor,
        fontSize: "12px",
        fontWeight: 600,
        height: "22px",
        borderRadius: "4px",
        padding: "1px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ".MuiChip-icon": {
          fontSize: "12px",
          marginLeft: 0,
          marginRight: "4px",
        },
        ".MuiChip-label": {
          padding: 0,
          display: "flex",
          alignItems: "center",
        }
      }}
    />
  );
}

export default MetaChip;