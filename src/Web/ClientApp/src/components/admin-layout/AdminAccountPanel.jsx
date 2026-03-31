import { memo, useCallback } from "react";
import { useNavigate, useLocation, matchPath } from "react-router";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import AvatarImage from "../../assets/images/avatar.jpg";
import accountMenuConfig from "./accountMenuConfig";

const panelWidth = 320;

function AdminAccountPanel({ open, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNavigate = useCallback(
    (url) => {
      navigate(url);
      onClose();
    },
    [navigate, onClose]
  );

  const handleLogout = useCallback(() => {
    // Logout logic placeholder
    onClose();
  }, [onClose]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: panelWidth,
            bgcolor: "background.paper",
            borderRadius: "16px 0 0 16px",
            backgroundImage: "none",
            boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
          },
        },
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
      transitionDuration={300}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Close button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", p: 1.5 }}>
          <IconButton
            onClick={onClose}
            sx={{
              width: 36,
              height: 36,
              color: "text.secondary",
              "&:hover": {
                bgcolor: "background.muted",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Profile section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: 3,
            pb: 3,
          }}
        >
          <Avatar
            alt="Admin User"
            src={AvatarImage}
            sx={{
              width: 96,
              height: 96,
              mb: 2,
              border: "3px solid",
              borderColor: "brand.lighter",
              boxShadow: "0 4px 14px rgba(63, 204, 178, 0.2)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              textAlign: "center",
            }}
          >
            Jaydon Frankie
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
              textAlign: "center",
              mt: 0.5,
            }}
          >
            demo@edunary.cc
          </Typography>
        </Box>

        <Divider />

        {/* Navigation menu */}
        <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
          {accountMenuConfig.map((item) => {
            const Icon = item.icon;
            const isActive = !!matchPath(
              { path: item.url, end: false },
              pathname
            );

            return (
              <ListItemButton
                key={item.id}
                onClick={() => handleNavigate(item.url)}
                sx={{
                  borderRadius: "10px",
                  mb: 0.5,
                  py: 1.2,
                  color: isActive ? "brand.dark" : "text.primary",
                  bgcolor: isActive ? "brand.lighter" : "transparent",
                  "&:hover": {
                    bgcolor: isActive ? "brand.lighter" : "background.muted",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "brand.main" : "text.tertiary",
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider />

        {/* Logout button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutOutlinedIcon />}
            sx={{
              borderRadius: "10px",
              py: 1.2,
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "error.main",
              borderColor: "rgba(255, 86, 48, 0.32)",
              bgcolor: "rgba(255, 86, 48, 0.04)",
              "&:hover": {
                borderColor: "error.main",
                bgcolor: "rgba(255, 86, 48, 0.08)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default memo(AdminAccountPanel);
