import { useEffect, useState, useCallback, memo } from "react";
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
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import AdminNavItem from "./AdminNavItem";
import { useAdminDrawer } from "./AdminDrawerContext";

const borderRadius = 8;

function AdminNavCollapse({ menu, level, parentId }) {
  const { pathname } = useLocation();
  const { drawerOpen } = useAdminDrawer();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClickMini = useCallback(
    (event) => {
      setAnchorEl(null);
      if (drawerOpen) {
        setOpen((prev) => !prev);
        setSelected((prev) => (!prev ? menu.id : null));
      } else {
        setAnchorEl(event?.currentTarget);
      }
    },
    [drawerOpen, menu.id]
  );

  const openMini = Boolean(anchorEl);

  const handleMiniClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClosePopper = useCallback(() => {
    setOpen(false);
    if (!openMini && !menu.url) {
      setSelected(null);
    }
    setAnchorEl(null);
  }, [openMini, menu.url]);

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
      setSelected(menu.id);
    }
  }, [pathname, menu]);

  const menus = menu.children?.map((item) => {
    switch (item.type) {
      case "collapse":
        return (
          <AdminNavCollapse
            key={item.id}
            menu={item}
            level={level + 1}
            parentId={parentId}
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
  });

  const isSelected = selected === menu.id;

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

  // Arrow icon matching the reference: small v / ^ chevron
  const arrowIcon =
    openMini || open ? (
      <KeyboardArrowUpIcon
        sx={{ fontSize: 18, color: "text.disabled" }}
      />
    ) : (
      <KeyboardArrowDownIcon
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
          ...(drawerOpen && { py: 1 }),
          "&:hover": {
            color: "brand.dark",
            bgcolor: level === 1 && drawerOpen ? "brand.lighter" : !drawerOpen && level === 1 ? "brand.lighter" : "transparent",
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

      {/* Expanded sidebar: inline collapse — clean list with dash bullets, NO tree line */}
      {drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {open && (
            <List disablePadding sx={{ pl: 2 }}>
              {menus}
            </List>
          )}
        </Collapse>
      )}
    </>
  );
}

export default memo(AdminNavCollapse);
