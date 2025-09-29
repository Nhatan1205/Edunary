import { Box, Divider, Menu } from "@mui/material";
import ProfileHeader from "../ProfileHeader";
import DesktopMenuItem from "./DesktopMenuItem";

function DesktopDropDownProfile({
  open,
  anchorEl,
  onClose,
  onItemClick,
  MENU_ITEMS,
  SIGN_OUTS,
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          mt: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* Profile Header */}
      <ProfileHeader onViewProfile={onItemClick} />

      {/* Menu Items */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {MENU_ITEMS.map((item) => (
          <DesktopMenuItem key={item.title} item={item} onClick={onItemClick} />
        ))}

        <Divider sx={{ borderColor: "divider", borderWidth: "1px" }} />

        <DesktopMenuItem item={SIGN_OUTS} onClick={onItemClick} />
      </Box>
    </Menu>
  );
}

export default DesktopDropDownProfile;
