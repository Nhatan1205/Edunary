import { Avatar, Box, Button, Typography } from "@mui/material";
import AvatarImage from "../../../assets/images/avatar.jpg";
import { useAuth } from "../../../context/AuthContext";

function ProfileHeader({ onViewProfile, isMobile }) {
  const { user } = useAuth();
  return (
    <Box
      sx={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: isMobile ? 2 : 3,
      }}
    >
      <Avatar
        alt={user?.fullName || user?.email || "User"}
        src={user?.avatar || AvatarImage}
        sx={{ width: 60, height: 60, bgcolor: "brand.main", mx: "auto", mb: 2 }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: 0.5,
          fontSize: "16px",
        }}
      >
        {user?.fullName || "User"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 2,
          fontSize: "13px",
        }}
      >
        {user?.email || ""}
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={() => onViewProfile("View Profile")}
        sx={{
          bgcolor: "brand.main",
          color: "text.inverse",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 1,
          py: 1,
          "&:hover": {
            bgcolor: "brand.dark",
          },
          px: isMobile ? 4 : 2,
        }}
      >
        View Profile
      </Button>
    </Box>
  );
}

export default ProfileHeader;
