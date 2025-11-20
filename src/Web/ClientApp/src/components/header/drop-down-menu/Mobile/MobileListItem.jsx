import { ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router";

function MobileListItem({ item, onClick, bordered = false }) {
  return (
    <ListItem
      button
      onClick={onClick}
      component={RouterLink}
      to={item.id ? `/course/search?category=${encodeURIComponent(item.id)}` : item.path}
      sx={{
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
        color: "text.primary",
        "&:hover": {
          color: "text.secondary",
          backgroundColor: "background.muted",
        },
        ...(bordered
          ? {
              border: "1px solid #ddd",
              borderRadius: "6px",
              mb: 1,
              color: "text.primary",
              "&:hover": {
                color: "text.secondary",
                backgroundColor: "background.muted",
              },
            }
          : { mb: 1 }),
      }}
    >
      <ListItemText
        primary={item.title}
        primaryTypographyProps={{
          fontSize: "14px",
          fontWeight: 500,
          color: "text.primary",
        }}
      />
    </ListItem>
  );
}

export default MobileListItem;
