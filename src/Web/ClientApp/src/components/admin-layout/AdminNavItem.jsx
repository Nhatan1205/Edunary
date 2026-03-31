import { memo } from "react";
import { Link, matchPath, useLocation } from "react-router";

import useMediaQuery from "@mui/material/useMediaQuery";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useAdminDrawer } from "./AdminDrawerContext";

const borderRadius = 8;

function AdminNavItem({ item, level }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const { pathname } = useLocation();
  const { drawerOpen, toggleDrawer } = useAdminDrawer();

  const isSelected = !!matchPath(
    { path: item.url, end: false },
    pathname
  );

  const Icon = item.icon;

  const itemIcon = item.icon ? (
    <Icon sx={{ fontSize: drawerOpen ? "20px" : "22px" }} />
  ) : (
    <Box
      sx={{
        width: 4,
        height: 4,
        borderRadius: "50%",
        bgcolor: isSelected ? "brand.main" : "text.disabled",
        transition: "all 0.2s ease",
      }}
    />
  );

  const handleClick = () => {
    if (downMD) toggleDrawer();
  };

  // Collapsed + level 1: icon stacked on top of label
  if (!drawerOpen && level === 1 && item.icon) {
    return (
      <ListItemButton
        component={Link}
        to={item.url}
        disabled={item.disabled}
        onClick={handleClick}
        selected={isSelected}
        sx={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: `${borderRadius}px`,
          mb: 0.5,
          py: 1,
          px: 0.5,
          color: isSelected ? "brand.dark" : "text.tertiary",
          "&:hover": {
            color: "brand.dark",
            bgcolor: "brand.lighter",
          },
          "&.Mui-selected": {
            color: "brand.dark",
            bgcolor: "brand.lighter",
            "&:hover": { bgcolor: "brand.lighter" },
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            color: isSelected ? "brand.main" : "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.4,
          }}
        >
          {itemIcon}
        </Box>

        {/* Title — 1 line, ellipsis */}
        <Typography
          noWrap
          sx={{
            fontSize: "0.65rem",
            fontWeight: isSelected ? 600 : 400,
            color: "inherit",
            lineHeight: 1.2,
            width: "100%",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>
      </ListItemButton>
    );
  }

  // Expanded sidebar OR sub-item
  return (
    <ListItemButton
      component={Link}
      to={item.url}
      disabled={item.disabled}
      sx={{
        borderRadius: `${borderRadius}px`,
        mb: 0.3,
        py: 0.8,
        color: isSelected ? "brand.dark" : "text.tertiary",
        "&:hover": {
          color: "brand.dark",
          bgcolor: level === 1 && drawerOpen ? "brand.lighter" : "transparent",
        },
        "&.Mui-selected": {
          color: "brand.dark",
          bgcolor: level === 1 && drawerOpen ? "brand.lighter" : "transparent",
          "&:hover": {
            bgcolor: level === 1 && drawerOpen ? "brand.lighter" : "transparent",
          },
        },
        ...(level > 1 && drawerOpen && { pl: 3.5 }),
      }}
      selected={isSelected}
      onClick={handleClick}
    >
      {/* Icon or bullet */}
      <ListItemIcon
        sx={{
          minWidth: item.icon ? 36 : 20,
          color: isSelected ? "brand.main" : "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: item.icon ? "flex-start" : "center",
        }}
      >
        {itemIcon}
      </ListItemIcon>

      <ListItemText
        primary={
          <Typography
            noWrap
            variant="body2"
            sx={{
              color: "inherit",
              fontWeight: isSelected ? 600 : 400,
              fontSize: "0.9rem",
            }}
          >
            {item.title}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default memo(AdminNavItem);
