import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CardMembershipOutlinedIcon from "@mui/icons-material/CardMembershipOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const accountMenuConfig = [
  {
    id: "home",
    title: "Home",
    icon: HomeOutlinedIcon,
    url: "/",
  },
  {
    id: "profile",
    title: "Profile",
    icon: PersonOutlineOutlinedIcon,
    url: "/user/profile",
  },
  {
    id: "account-settings",
    title: "Account settings",
    icon: SettingsOutlinedIcon,
    url: "/user/security",
  },
];

export default accountMenuConfig;
