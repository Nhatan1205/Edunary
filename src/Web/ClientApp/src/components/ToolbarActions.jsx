import { useState } from "react";
import AvatarImage from "../assets/images/avatar.jpg";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink } from "react-router";
import DropDownProfile from "../components/header/drop-down-profile/DropDownProfile";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import {
  Badge,
  useTheme,
  Avatar,
  IconButton,
  useMediaQuery,
  Button,
  Toolbar,
} from "@mui/material";
import useGetBasicUserInfo from "../hooks/useGetBasicUserInfor";
import NotificationPopup from "./notification-popup/NotificationPopup";
import useGetNotificationsByUserId from "../hooks/useGetNotificationByUserId";
function ToolbarActions() {
  const { user } = useAuth();
  const { data: userInfo } = useGetBasicUserInfo();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const isOpenProfile = Boolean(anchorElProfile);

  const handleOpenProfile = (event) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);

  const [anchorElNotification, setAnchorElNotification] = useState(null);
  const isOpenNotification = Boolean(anchorElNotification);

  const handleOpenNotification = (event) =>
    setAnchorElNotification(event.currentTarget);
  const handleCloseNotification = () => setAnchorElNotification(null);
  const { data: dataNofications } = useGetNotificationsByUserId();
  return (
    <Toolbar>
      <Button
        component={RouterLink}
        to="/"
        sx={{
          color: "text.primary",
          textTransform: "none",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "500",
          borderRadius: "8px",
          whiteSpace: "nowrap",
          "&:hover": {
            color: "text.secondary",
            backgroundColor: "background.muted",
          },
        }}
      >
        Student
      </Button>
      <IconButton
        size={isMobile ? "medium" : "large"}
        aria-label="show cart items"
        sx={{
          color: "text.primary",
          padding: isMobile ? "6px" : "10px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "background.muted",
          },
        }}
      >
        <Badge badgeContent={3} color="error" showZero>
          <ShoppingCartOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
        </Badge>
      </IconButton>

      <IconButton
        size={isMobile ? "medium" : "large"}
        aria-label="show new notifications"
        sx={{
          color: "text.primary",
          padding: isMobile ? "6px" : "10px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "background.muted",
          },
        }}
        onClick={handleOpenNotification}
      >
        <Badge
          badgeContent={dataNofications?.unreadCount}
          color="error"
          size="medium"
        >
          <NotificationsNoneOutlinedIcon
            fontSize={isMobile ? "small" : "medium"}
          />
        </Badge>
      </IconButton>
      <NotificationPopup
        open={isOpenNotification}
        anchorEl={anchorElNotification}
        handleClosePopup={handleCloseNotification}
        notifications={dataNofications?.list}
      />

      {/* dropdown profile */}
      <IconButton
        size={isMobile ? "medium" : "large"}
        aria-label="user account"
        sx={{
          color: "text.primary",
          padding: isMobile ? "6px" : "10px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "background.muted",
          },
        }}
        onClick={handleOpenProfile}
      >
        <Avatar
          alt={userInfo?.fullName || user?.email || "User"}
          src={userInfo?.avatar || AvatarImage}
          sx={{
            width: isMobile ? 32 : 40,
            height: isMobile ? 32 : 40,
          }}
        />
      </IconButton>
      <DropDownProfile
        open={isOpenProfile}
        anchorEl={anchorElProfile}
        handleCloseDropDown={handleCloseProfile}
        isMobile={isMobile}
      />
    </Toolbar>
  );
}

export default ToolbarActions;
