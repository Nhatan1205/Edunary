import { Help, Language, Logout, School, Settings } from "@mui/icons-material";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import MobileDropDownProfile from "./Mobile/MobileDropDownProfile";
import InterestsIcon from '@mui/icons-material/Interests';
import DesktopDropDownProfile from "./Desktop/DesktopDropDownProfile";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const MENU_ITEMS = [
  {
    title: "My Classes",
    icon: <School fontSize="small" />,
    path: "/classes",
  },
  {
    title: "Notifications",
    icon: <NotificationsNoneOutlinedIcon fontSize="small" />,
    path: "/user/notifications",
  },
  {
    title: "Messages",
    icon: <ChatOutlinedIcon fontSize="small" />,
    path: "/messages",
  },
  {
    title: "Account Settings",
    icon: <Settings fontSize="small" />,
    path: "/user/security",
  },
  {
    title: "Language: English",
    icon: <Language fontSize="small" />,
    path: "/language",
  },
  {
    title: "Teaching On Edunary",
    icon: <LocalLibraryOutlinedIcon fontSize="small" />,
    path: "/instructor",
  },
  {
    title: "Help",
    icon: <Help fontSize="small" />,
    path: "/help",
  },
  {
    title: "Add/Edit your interests",
    icon: <InterestsIcon fontSize="small" />,
    path: "/personalize",
  },
];

const SIGN_OUTS = {
  title: "Sign Out",
  icon: <Logout fontSize="small" />,
  path: "/",
};

function DropDownProfile({
  open,
  anchorEl,
  handleCloseDropDown,
  isMobile = false,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuItemClick = (action, path) => {
    handleCloseDropDown();

    // Handle logout
    if (action === "Sign Out") {
      logout();
      toast.success("Logged out successfully!");
      navigate("/");
    } else if (path) {
      navigate(path);
    }
  };

  return isMobile ? (
    <MobileDropDownProfile
      open={open}
      onClose={handleCloseDropDown}
      onItemClick={handleMenuItemClick}
      MENU_ITEMS={MENU_ITEMS}
      SIGN_OUTS={SIGN_OUTS}
    />
  ) : (
    <DesktopDropDownProfile
      open={open}
      anchorEl={anchorEl}
      onClose={handleCloseDropDown}
      onItemClick={handleMenuItemClick}
      MENU_ITEMS={MENU_ITEMS}
      SIGN_OUTS={SIGN_OUTS}
    />
  );
}

export default DropDownProfile;
