import { MenuItem, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
function DesktopSection({
  title,
  items,
  onItemClick,
  bordered = false,
  sx = {},
}) {
  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          mb: 2,
          ...sx,
        }}
      >
        {title}
      </Typography>
      {items.map((item, index) =>
        bordered ? (
          <MenuItem
            key={item.id || index}
            onClick={onItemClick}
            component={RouterLink}
            to={item.path}
            sx={{
              borderRadius: "6px",
              color: "text.primary",
              "&:hover": {
                color: "text.secondary",
                backgroundColor: "background.muted",
              },
              padding: "10px 16px",
              mb: 2,
              cursor: "pointer",
              border: "1px solid #666",
            }}
          >
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              {item.title}
            </Typography>
          </MenuItem>
        ) : (
          <MenuItem
            key={item.id || index}
            onClick={onItemClick}
            component={RouterLink}
            to={`/course/search?category=${encodeURIComponent(item.id)}`}
            sx={{
              borderRadius: "6px",
              fontWeight: 500,
              color: "text.primary",
              "&:hover": {
                color: "text.secondary",
                backgroundColor: "background.muted",
              },
              padding: "8px",
              minHeight: "auto",
              fontSize: "15px",
            }}
          >
            {item.title}
          </MenuItem>
        ),
      )}
    </>
  );
}

export default DesktopSection;
