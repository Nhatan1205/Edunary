import { Help, Language, Logout, School, Settings } from "@mui/icons-material";
import MobileDropDownProfile from "./Mobile/MobileDropDownProfile";
import DesktopDropDownProfile from "./Desktop/DesktopDropDownProfile";

const MENU_ITEMS = [
  {
    title: "My Classes",
    icon: <School fontSize="small" />,
    path: "/classes",
  },
  {
    title: "Account Settings",
    icon: <Settings fontSize="small" />,
    path: "/counter",
  },
  {
    title: "Language: English",
    icon: <Language fontSize="small" />,
    path: "/language",
  },
  {
    title: "Help",
    icon: <Help fontSize="small" />,
    path: "/help",
  },
];

const SIGN_OUTS = {
  title: "Sign Out",
  icon: <Logout fontSize="small" />,
  path: "/",
};

function DropDownProfile({ open, anchorEl, handleCloseDropDown, isMobile }) {
  const handleMenuItemClick = (action) => {
    console.log(`Clicked: ${action}`);
    handleCloseDropDown();
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
