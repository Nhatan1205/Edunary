import {
  Avatar,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import useGetBasicUserInfo from "../../../hooks/useGetBasicUserInfor";
import AvatarImage from "../../../assets/images/avatar.jpg";

const getNavItems = (userId) => [
  { label: "View public profile", path: `/profile/${userId}`, external: true },
  { label: "Profile", path: "/user/profile" },
  { label: "Photo", path: "/user/photo" },
  { label: "Account Security", path: "/user/security" },
];

function ProfileSidebar() {
  const location = useLocation();
  const { data: userInfo } = useGetBasicUserInfo();
  return (
    <Box sx={{ width: 230, flexShrink: 0 }}>
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
          alt={userInfo?.fullName || "User"}
          src={userInfo?.avatar || AvatarImage}
        />
        <Typography
          variant="body1"
          fontWeight={600}
          align="center"
          sx={{ color: "text.primary" }}
        >
          {userInfo?.fullName || "User"}
        </Typography>
      </Box>

      <List disablePadding>
        {getNavItems(userInfo?.userId).map((item) => {
          const isActive = !item.external && location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={item.external ? "a" : NavLink}
              {...(item.external
                ? { href: item.path, target: "_blank", rel: "noopener noreferrer" }
                : { to: item.path })}
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
    </Box >
  );
}

export default ProfileSidebar;
