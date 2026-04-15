import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useLocation, matchPath } from "react-router";

import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import AdminNavItem from "./AdminNavItem";
import { useAdminDrawer } from "./AdminDrawerContext";

const borderRadius = 8;

function AdminNavCollapse({ menu, level }) {
  const { pathname } = useLocation();
  const { drawerOpen } = useAdminDrawer();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickMini = useCallback(
    (event) => {
      setAnchorEl(null);
      if (drawerOpen) {
        setOpen((prev) => !prev);
      } else {
        setAnchorEl(event?.currentTarget);
      }
    },
    [drawerOpen]
  );

  const openMini = Boolean(anchorEl);

  const handleMiniClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClosePopper = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Auto-expand if any child route is active
  useEffect(() => {
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

    if (checkChildren(menu.children)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [pathname, menu]);

  const menus = useMemo(
    () =>
      menu.children?.map((item) => {
        switch (item.type) {
          case "collapse":
            return (
              <AdminNavCollapse
                key={item.id}
                menu={item}
                level={level + 1}
              />
            );
          case "item":
            return (
              <AdminNavItem key={item.id} item={item} level={level + 1} />
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
      }),
    [menu.children, level]
  );

  const isSelected = open;

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

  // Arrow icon: ChevronRight when closed, KeyboardArrowDown when open
  const arrowIcon =
    openMini || open ? (
      <KeyboardArrowDownIcon
        sx={{ fontSize: 18, color: "text.disabled" }}
      />
    ) : (
      <ChevronRightIcon
        sx={{ fontSize: 18, color: "text.disabled" }}
      />
    );

  return (
    <>
      <ListItemButton
        sx={{
          zIndex: 1201,
          borderRadius: `${borderRadius}px`,
          mb: 0.5,
          color: "text.tertiary",
          // Collapsed level 1: column layout — icon top, label below
          ...(!drawerOpen && level === 1 && {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 1,
            px: 0.5,
          }),
          // Expanded
          ...(drawerOpen && { py: 1, px: 1 }),
          "&:hover": {
            color: "brand.dark",
            bgcolor: level === 1 ? "brand.lighter" : "transparent",
          },
          "&.Mui-selected": {
            color: "brand.dark",
            bgcolor: level === 1 ? "brand.lighter" : "transparent",
            "&:hover": {
              bgcolor: level === 1 ? "brand.lighter" : "transparent",
            },
          },
        }}
        selected={isSelected}
        {...(!drawerOpen && {
          onMouseEnter: handleClickMini,
          onMouseLeave: handleMiniClose,
        })}
        className={anchorEl ? "Mui-selected" : ""}
        onClick={handleClickMini}
      >
        {/* Icon */}
        {menuIcon && (
          <ListItemIcon
            sx={{
              minWidth: !drawerOpen && level === 1 ? "auto" : 36,
              color: isSelected ? "brand.main" : "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...(!drawerOpen && level === 1 && { mb: 0.4 }),
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}

        {/* Label */}
        {/* Collapsed level 1: show short label below icon */}
        {!drawerOpen && level === 1 && (
          <Typography
            noWrap
            sx={{
              fontSize: "0.65rem",
              fontWeight: isSelected || anchorEl ? 600 : 400,
              color: "inherit",
              lineHeight: 1.2,
              width: "100%",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {menu.title}
          </Typography>
        )}

        {/* Expanded: normal label + arrow */}
        {drawerOpen && (
          <>
            <ListItemText
              primary={
                <Typography
                  noWrap
                  variant="body1"
                  sx={{
                    color: "inherit",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: isSelected || anchorEl ? 600 : 400,
                    fontSize: "0.9rem",
                  }}
                >
                  {menu.title}
                </Typography>
              }
            />
            {arrowIcon}
          </>
        )}

        {/* Floating popper when collapsed */}
        {!drawerOpen && (
          <Popper
            open={openMini}
            anchorEl={anchorEl}
            placement="right-start"
            modifiers={[
              {
                name: "offset",
                options: { offset: [-12, 1] },
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
                  borderRadius: "12px",
                }}
              >
                <ClickAwayListener onClickAway={handleClosePopper}>
                  <Box sx={{ p: 1 }}>{menus}</Box>
                </ClickAwayListener>
              </Paper>
            </Grow>
          </Popper>
        )}
      </ListItemButton>

      {/* Expanded sidebar: inline collapse with subtree lines */}
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: "28px",
              "&::before": {
                content: '""',
                position: "absolute",
                left: "20px",
                top: 0,
                bottom: 8,
                width: "1px",
                bgcolor: "divider",
              },
            }}
          >
            <List disablePadding>
              {menus}
            </List>
          </Box>
        </Collapse>
      )}
    </>
  );
}

export default memo(AdminNavCollapse);
