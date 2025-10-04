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
function ToolbarActions() {
  const { user } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const isOpenProfile = Boolean(anchorElProfile);

  const handleOpenProfile = (event) => setAnchorElProfile(event.currentTarget);
  const handleCloseProfile = () => setAnchorElProfile(null);
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
      >
        <Badge badgeContent={5} color="error" size="medium" showZero>
          <NotificationsNoneOutlinedIcon
            fontSize={isMobile ? "small" : "medium"}
          />
        </Badge>
      </IconButton>

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
          alt={user?.fullName || user?.email || "User"}
          src={user?.avatar || AvatarImage}
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
