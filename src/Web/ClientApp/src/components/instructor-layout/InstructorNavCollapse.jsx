import { useEffect, useRef, useState, useMemo, memo } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { alpha } from "@mui/material/styles";

import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import InstructorNavItem from "./InstructorNavItem";
import { useDrawer } from "./DrawerContext";

const borderRadius = 8;

function InstructorNavCollapse({ menu, level, parentId }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const { drawerOpen } = useDrawer();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickMini = (event) => {
    setAnchorEl(null);
    if (drawerOpen) {
      setOpen((prev) => !prev);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const openMini = Boolean(anchorEl);

  const handleMiniClose = () => {
    setAnchorEl(null);
  };

  const handleClosePopper = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  // Check if any child route is active
  const hasActiveChild = useMemo(() => {
    const checkChildren = (children) => {
      if (!children) return false;
      return children.some((child) => {
        if (
          child.url &&
          matchPath({ path: child.url, end: false }, pathname)
        ) {
          return true;
        }
        if (child.children) return checkChildren(child.children);
        return false;
      });
    };
    return checkChildren(menu.children);
  }, [pathname, menu]);

  // Auto-expand if any child route is active
  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [hasActiveChild]);

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

  const menus = menu.children?.map((item) => {
    switch (item.type) {
      case "collapse":
        return (
          <InstructorNavCollapse
            key={item.id}
            menu={item}
            level={level + 1}
            parentId={parentId}
          />
        );
      case "item":
        return (
          <InstructorNavItem key={item.id} item={item} level={level + 1} />
        );
      default:
        return (
          <Typography
            key={item.id}
            variant="h6"
            align="center"
            sx={{ color: "error.main" }}
          >
            Menu Items Error
          </Typography>
        );
    }
  });

  // isSelected = true only when a child is actively matching the route
  const isSelected = hasActiveChild;

  const Icon = menu.icon;
  const menuIcon = menu.icon ? (
    <Icon sx={{ fontSize: drawerOpen ? "20px" : "24px" }} />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: isSelected ? 8 : 6,
        height: isSelected ? 8 : 6,
      }}
      fontSize={level > 0 ? "inherit" : "medium"}
    />
  );

  const collapseIcon = drawerOpen ? (
    <ExpandLessIcon
      sx={{ fontSize: "16px", mt: "auto", mb: "auto", color: "inherit" }}
    />
  ) : (
    <ChevronRightIcon
      sx={{ fontSize: "16px", mt: "auto", mb: "auto", color: "inherit" }}
    />
  );

  return (
    <>
      <ListItemButton
        sx={{
          zIndex: 1201,
          borderRadius: `${borderRadius}px`,
          mb: 0.5,
          // Default: text.secondary. Active (has active child): brand.main.
          color: isSelected ? "brand.main" : "text.secondary",
          // Hover: MUI default gray, no custom color change
          "&:hover": {},
          "&.Mui-selected": {
            color: "brand.main",
            bgcolor: (theme) => alpha(theme.palette.brand.main, 0.08),
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.brand.main, 0.16),
            },
          },
          ...(drawerOpen && level !== 1 && { ml: `${level * 18}px` }),
          ...(!drawerOpen && { pl: 1.25 }),
          ...((!drawerOpen || level !== 1) && {
            py: level === 1 ? 0 : 1,
          }),
        }}
        selected={isSelected}
        {...(!drawerOpen && {
          onMouseEnter: handleClickMini,
          onMouseLeave: handleMiniClose,
        })}
        className={anchorEl ? "Mui-selected" : ""}
        onClick={handleClickMini}
      >
        {menuIcon && (
          <ListItemIcon
            sx={{
              minWidth: level === 1 ? 36 : 18,
              color: "inherit",
              ...(!drawerOpen &&
                level === 1 && {
                  borderRadius: `${borderRadius}px`,
                  width: 46,
                  height: 46,
                  alignItems: "center",
                  justifyContent: "center",
                }),
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}

        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <Tooltip title={menu.title} disableHoverListener={!hoverStatus}>
            <ListItemText
              primary={
                <Typography
                  ref={ref}
                  noWrap
                  variant="body1"
                  sx={{
                    color: "inherit",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: 120,
                    // Bold when open (whether active child or not)
                    fontWeight: open || anchorEl ? 600 : 400,
                  }}
                >
                  {menu.title}
                </Typography>
              }
            />
          </Tooltip>
        )}

        {openMini || open ? (
          collapseIcon
        ) : (
          <ExpandMoreIcon
            sx={{ fontSize: "16px", mt: "auto", mb: "auto", color: "inherit" }}
          />
        )}

        {!drawerOpen && (
          <Popper
            open={openMini}
            anchorEl={anchorEl}
            placement="right-start"
            modifiers={[
              {
                name: "offset",
                options: { offset: [-12, 0] },
              },
            ]}
            sx={{
              overflow: "visible",
              zIndex: 2001,
              minWidth: 180,
            }}
          >
            <Grow in={openMini}>
              <Paper
                sx={{
                  overflow: "hidden",
                  boxShadow: 8,
                  backgroundImage: "none",
                }}
              >
                <ClickAwayListener onClickAway={handleClosePopper}>
                  <Box>{menus}</Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          </Popper>
        )}
      </ListItemButton>

      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {open && (
            <List
              disablePadding
              sx={{
                position: "relative",
                "&:after": {
                  content: "''",
                  position: "absolute",
                  left: "25px",
                  top: 0,
                  height: "100%",
                  width: "1px",
                  opacity: 1,
                  bgcolor: "brand.light",
                },
              }}
            >
              {menus}
            </List>
          )}
        </Collapse>
      )}
    </>
  );
}

export default memo(InstructorNavCollapse);
