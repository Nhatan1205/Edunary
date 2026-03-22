import { useEffect, useRef, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { useDrawer } from "./DrawerContext";

export default function InstructorNavItem({ item, level }) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down("md"));
  const ref = useRef(null);
  const { pathname } = useLocation();
  const { drawerOpen, toggleDrawer } = useDrawer();

  const isSelected = !!matchPath(
    { path: item.url, end: false },
    pathname
  );

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

  const itemHandler = () => {
    if (downMD) toggleDrawer();
  };

  const borderRadius = 8;

  return (
    <ListItemButton
      component={Link}
      to={item.url}
      disabled={item.disabled}
      disableRipple={!drawerOpen}
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
      onClick={itemHandler}
    >
      <ButtonBase
        aria-label="nav-icon"
        sx={{ borderRadius: `${borderRadius}px` }}
        disableRipple={drawerOpen}
      >
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
                ...(isSelected && {
                  bgcolor: "brand.lighter",
                  "&:hover": { bgcolor: "brand.lighter" },
                }),
              }),
          }}
        >
          {itemIcon}
        </ListItemIcon>
      </ButtonBase>

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
                  fontWeight: isSelected ? 600 : 400,
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
