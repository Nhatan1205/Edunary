import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";

const NAV_ITEMS = [
  { label: "View public profile", path: "/" },
  { label: "Profile", path: "/user/profile" },
  { label: "Photo", path: "/user/photo" },
  { label: "Account Security", path: "/user/security" },
];

// Mock user data
const mockUser = {
  name: "Phuc Lam",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileSidebar() {
  const location = useLocation();

  return (
    <Box sx={{ width: 230, flexShrink: 0 }}>
      {/* Avatar & Name */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pb: 2,
          px: 1,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            fontSize: "1.8rem",
            fontWeight: 700,
            mb: 1,
            bgcolor: "#1a1a1a",
            color: "#fff",
          }}
        >
          {getInitials(mockUser.name)}
        </Avatar>
        <Typography
          variant="body1"
          fontWeight={600}
          align="center"
          sx={{ color: "text.primary" }}
        >
          {mockUser.name}
        </Typography>
      </Box>

      {/* Nav List */}
      <List disablePadding>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={isActive}
              sx={{
                py: 0.75,
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: (theme) => theme.palette.background.muted,
                },
                "&.Mui-selected:hover": {
                  backgroundColor: (theme) => theme.palette.background.muted,
                },
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.background.muted,
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "text.primary" : "text.secondary",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default ProfileSidebar;
