import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Lightbulb } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

import ToolbarActions from "../ToolbarActions";
import { useDrawer } from "./DrawerContext";

export default function InstructorHeader() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down("md"));
  const { drawerOpen, toggleDrawer } = useDrawer();

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? "auto" : 228, display: "flex" }}>
        <Box
          component="span"
          sx={{
            display: { xs: "none", md: "flex" },
            flexGrow: 1,
            alignItems: "center",
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            aria-label="logo"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              gap: 1,
            }}
          >
            <Lightbulb
              sx={{
                color: "brand.main",
                width: 30,
                height: 30,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "brand.main",
                fontWeight: 700,
              }}
            >
              Edunary
            </Typography>
          </Link>
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            width: 34,
            height: 34,
            overflow: "hidden",
            transition: "all .2s ease-in-out",
            cursor: "pointer",
            color: theme.palette.brand?.dark || theme.palette.primary.dark,
            background:
              theme.palette.brand?.lighter || theme.palette.primary.light,
            "&:hover": {
              color:
                theme.palette.brand?.lighter || theme.palette.primary.light,
              background:
                theme.palette.brand?.dark || theme.palette.primary.dark,
            },
          }}
          onClick={toggleDrawer}
        >
          <MenuIcon sx={{ fontSize: "16px" }} />
        </Avatar>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* toolbar actions (Student link, cart, notifications, profile) */}
      <ToolbarActions />
    </>
  );
}
