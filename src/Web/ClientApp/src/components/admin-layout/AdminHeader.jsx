import { useState, useCallback, memo } from "react";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Badge from "@mui/material/Badge";

import AvatarImage from "../../assets/images/avatar.jpg";
import { useAdminDrawer } from "./AdminDrawerContext";
import AdminSearchDialog from "./AdminSearchDialog";
import AdminAccountPanel from "./AdminAccountPanel";
import useGetBasicUserInfo from "../../hooks/auth-hooks/useGetBasicUserInfor";

function AdminHeader() {
  const { toggleDrawer, downMD } = useAdminDrawer();
  const { data: userInfo } = useGetBasicUserInfo();

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setSearchOpen(false), []);
  const handleOpenAccount = useCallback(() => setAccountOpen(true), []);
  const handleCloseAccount = useCallback(() => setAccountOpen(false), []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 1,
        }}
      >
        {/* Mobile hamburger */}
        {downMD && (
          <IconButton
            onClick={toggleDrawer}
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              color: "text.primary",
              "&:hover": {
                bgcolor: "background.muted",
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}

        {/* Spacer — push everything to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Search button — on the right */}
        <Box
          onClick={handleOpenSearch}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "10px",
            bgcolor: "background.muted",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.06)",
            },
            minWidth: downMD ? "auto" : 180,
          }}
        >
          <SearchOutlinedIcon
            sx={{ fontSize: 20, color: "text.disabled" }}
          />
          {!downMD && (
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                flexGrow: 1,
                userSelect: "none",
                fontSize: "0.85rem",
              }}
            >
              Search...
            </Typography>
          )}
        </Box>

        {/* Notifications */}
        <IconButton
          sx={{
            color: "text.primary",
            borderRadius: "8px",
            "&:hover": {
              bgcolor: "background.muted",
            },
          }}
        >
          <Badge badgeContent={4} color="error">
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        {/* Avatar */}
        <IconButton
          onClick={handleOpenAccount}
          sx={{
            p: 0.5,
            borderRadius: "50%",
            border: "2px solid transparent",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "brand.light",
            },
          }}
        >
          <Avatar
            alt={userInfo?.fullName || "Admin"}
            src={userInfo?.avatar || undefined}
            sx={{ width: 36, height: 36 }}
          />
        </IconButton>
      </Box>

      {/* Search dialog */}
      <AdminSearchDialog open={searchOpen} onClose={handleCloseSearch} />

      {/* Account panel */}
      <AdminAccountPanel open={accountOpen} onClose={handleCloseAccount} />
    </>
  );
}

export default memo(AdminHeader);
