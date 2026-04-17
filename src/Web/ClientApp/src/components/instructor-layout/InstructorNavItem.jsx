import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { alpha } from "@mui/material/styles";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { useDrawer } from "./DrawerContext";

const borderRadius = 8;

function InstructorNavItem({ item, level }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const { drawerOpen, toggleDrawer, downMD } = useDrawer();

  const isSelected = !!matchPath(
    { path: item.url, end: false },
    pathname
  );

  const isSubItem = level > 1;

  const [hoverStatus, setHover] = useState(false);

  const compareSize = () => {
    const compare =
      ref.current && ref.current.scrollWidth > ref.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
    window.addEventListener("resize", compareSize);
    return () => window.removeEventListener("resize", compareSize);
  }, []);

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon
      sx={{
        fontSize: drawerOpen ? "20px" : "24px",
      }}
    />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: isSelected ? 8 : 6,
        height: isSelected ? 8 : 6,
      }}
      fontSize={level > 0 ? "inherit" : "medium"}
    />
  );

  const handleClick = useCallback(() => {
    if (downMD) toggleDrawer();
  }, [downMD, toggleDrawer]);

  // Collapsed level 1 with icon: icon-only button
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
          "&:hover": {},
          "&.Mui-selected": {
            color: "brand.main",
            bgcolor: (theme) => alpha(theme.palette.brand.main, 0.08),
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.brand.main, 0.16) },
          },
        }}
      >
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
        zIndex: 1201,
        borderRadius: `${borderRadius}px`,
        mb: 0.5,
        color: isSelected
          ? isSubItem
            ? "text.primary"   // sub-item active → text.primary (bold via fontWeight)
            : "brand.main"     // top-level active → brand
          : "text.secondary",
        // Hover: MUI default gray, no custom color
        "&:hover": {},
        "&.Mui-selected": isSubItem
          ? {
            fontWeight: 700,
            bgcolor: "action.selected",
            "&:hover": { bgcolor: "action.selected" },
          }
          : {
            color: "brand.main",
            bgcolor: (theme) => alpha(theme.palette.brand.main, 0.08),
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.brand.main, 0.16) },
          },
        ...(drawerOpen && level !== 1 && { ml: `${level * 18}px` }),
        ...(!drawerOpen && { pl: 1.25 }),
        ...((!drawerOpen || level !== 1) && {
          py: level === 1 ? 0 : 1,
        }),
      }}
      selected={isSelected}
      onClick={handleClick}
    >
      <ListItemIcon
        sx={{
          minWidth: level === 1 ? 36 : 18,
          color: "inherit",
        }}
      >
        {itemIcon}
      </ListItemIcon>

      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <Tooltip title={item.title} disableHoverListener={!hoverStatus}>
          <ListItemText
            primary={
              <Typography
                ref={ref}
                noWrap
                variant="body1"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: 120,
                  color: "inherit",
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                {item.title}
              </Typography>
            }
          />
        </Tooltip>
      )}
    </ListItemButton>
  );
}

export default memo(InstructorNavItem);
