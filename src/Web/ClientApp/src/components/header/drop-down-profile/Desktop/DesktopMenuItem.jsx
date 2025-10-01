import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function DesktopMenuItem({ item, onClick }) {
  return (
    <MenuItem
      component={RouterLink}
      to={item.path}
      onClick={() => onClick(item.title, item.path)}
      sx={{
        py: 1.5,
        px: 3,
        justifyContent: "flex-start",
        width: "100%",
        color: "text.primary",
        "&:hover": {
          bgcolor: "background.muted",
          color: "brand.dark",
          "& .MuiListItemIcon-root": {
            color: "brand.dark",
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      <ListItemText
        primary={item.title}
        primaryTypographyProps={{
          fontSize: "14px",
          fontWeight: 500,
        }}
      />
    </MenuItem>
  );
}

export default DesktopMenuItem;
