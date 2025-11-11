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
        fontSize: "11px",
        fontWeight: 600,
        height: "22px",
        borderRadius: "4px",
        padding: "0px",
        ".MuiChip-icon": {
          fontSize: "14px",
          marginLeft: "4px"
        }
      }}
    />
  );
}

export default MetaChip;
