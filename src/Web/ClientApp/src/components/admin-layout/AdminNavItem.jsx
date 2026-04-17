import { memo, useCallback } from "react";
import { alpha } from "@mui/material/styles";
import { Link, matchPath, useLocation } from "react-router";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useAdminDrawer } from "./AdminDrawerContext";

const borderRadius = 8;

function AdminNavItem({ item, level }) {
  const { pathname } = useLocation();
  const { drawerOpen, toggleDrawer, downMD } = useAdminDrawer();

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

  const handleClick = useCallback(() => {
    if (downMD) toggleDrawer();
  }, [downMD, toggleDrawer]);

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
          color: isSelected ? "brand.main" : "text.secondary",
          "&:hover": {
            // MUI default hover (gray), text/icon color unchanged
          },
          "&.Mui-selected": {
            color: "brand.main",
            bgcolor: (theme) => alpha(theme.palette.brand.main, 0.08),
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.brand.main, 0.16) },
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            color: "inherit",
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
  // level === 1 → standalone item (no parent collapse)
  // level > 1  → child inside a collapse
  const isSubItem = level > 1;

  return (
    <ListItemButton
      component={Link}
      to={item.url}
      disabled={item.disabled}
      sx={{
        borderRadius: `${borderRadius}px`,
        mb: 0.3,
        py: 0.8,
        // Default color
        color: isSelected
          ? isSubItem
            ? "text.primary"   // sub-item active → inherit text (bold via fontWeight)
            : "brand.main"     // top-level active → brand
          : "text.secondary",
        position: "relative",
        // Horizontal connector line for subitems
        ...(isSubItem && drawerOpen && {
          "&::before": {
            content: '""',
            position: "absolute",
            left: "-8px",
            top: "50%",
            width: "8px",
            height: "1px",
            bgcolor: "divider",
          },
        }),
        // Hover: MUI default gray, no custom color
        "&:hover": {},
        "&.Mui-selected": isSubItem
          ? {
              // Sub-item active: bold text + MUI action.selected bg
              fontWeight: 700,
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.selected" },
            }
          : {
              // Top-level active: brand.main text + 8% opacity bg
              color: "brand.main",
              bgcolor: (theme) => alpha(theme.palette.brand.main, 0.08),
              "&:hover": { bgcolor: (theme) => alpha(theme.palette.brand.main, 0.16) },
            },
        ...(isSubItem && drawerOpen && { pl: 1.5 }),
      }}
      selected={isSelected}
      onClick={handleClick}
    >
      {/* Icon or bullet — hide dot for subitems */}
      {(item.icon || level === 1) && (
        <ListItemIcon
          sx={{
            minWidth: item.icon ? 36 : 20,
            color: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: item.icon ? "flex-start" : "center",
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}

      <ListItemText
        primary={
          <Typography
            noWrap
            variant="body2"
            sx={{
              color: "inherit",
              fontWeight: isSelected ? 700 : 400,
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
