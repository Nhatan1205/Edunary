import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
function MobileMenuItem({ item, onClick }) {
  return (
    <ListItem
      button
      onClick={() => onClick(item.title)}
      component={RouterLink}
      to={item.path}
      sx={{
        borderRadius: "6px",
        mb: 1,
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
    </ListItem>
  );
}

export default MobileMenuItem;
