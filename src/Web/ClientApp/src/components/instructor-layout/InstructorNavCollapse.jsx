import { useEffect, useRef, useState } from "react";
import { useLocation, matchPath } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
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

export default function InstructorNavCollapse({ menu, level, parentId }) {
  const theme = useTheme();
  const ref = useRef(null);
  const { pathname } = useLocation();
  const { drawerOpen } = useDrawer();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const borderRadius = 8;

  const handleClickMini = (event) => {
    setAnchorEl(null);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
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
    if (!openMini) {
      if (!menu.url) {
        setSelected(null);
      }
    }
    setAnchorEl(null);
  };

  // Check if any child is active to auto-expand
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

  const collapseIcon = drawerOpen ? (
    <ExpandLessIcon
      sx={{ fontSize: "16px", mt: "auto", mb: "auto" }}
    />
  ) : (
    <ChevronRightIcon
      sx={{ fontSize: "16px", mt: "auto", mb: "auto" }}
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
          ...(drawerOpen &&
            level !== 1 && { ml: `${level * 18}px` }),
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
              color: isSelected ? "brand.main" : "inherit",
              ...(!drawerOpen &&
                level === 1 && {
                  borderRadius: `${borderRadius}px`,
                  width: 46,
                  height: 46,
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { bgcolor: "brand.lighter" },
                  ...((isSelected || anchorEl) && {
                    bgcolor: "brand.lighter",
                    "&:hover": { bgcolor: "brand.lighter" },
                  }),
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
                    fontWeight: isSelected || anchorEl ? 600 : 400,
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
            sx={{ fontSize: "16px", mt: "auto", mb: "auto" }}
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
                  boxShadow: theme.shadows[8],
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
