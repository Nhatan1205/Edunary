import { Close } from "@mui/icons-material";
import { Box, Divider, Drawer, IconButton, List } from "@mui/material";
import ProfileHeader from "../ProfileHeader";
import MobileMenuItem from "./MobileMenuItem";

function MobileDropDownProfile({
  open,
  onClose,
  onItemClick,
  MENU_ITEMS,
  SIGN_OUTS,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "60%",
          maxWidth: "300px",
          backgroundColor: "white",
        },
      }}
      SlideProps={{ direction: "left" }}
    >
      <Box sx={{ p: 2 }}>
        {/* Close Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Profile Header */}
        <ProfileHeader onViewProfile={onItemClick} isMobile />

        {/* Menu Items */}
        <List>
          {MENU_ITEMS.map((item) => (
            <MobileMenuItem
              key={item.title}
              item={item}
              onClick={onItemClick}
            />
          ))}
        </List>

        <Divider sx={{ borderColor: "divider", borderWidth: "1px" }} />

        <List>
          <MobileMenuItem item={SIGN_OUTS} onClick={onItemClick} />
        </List>
      </Box>
    </Drawer>
  );
}

export default MobileDropDownProfile;
