import { Avatar, Box, Button, Typography } from "@mui/material";
import AvatarImage from "../../../assets/images/avatar.jpg";

function ProfileHeader({ onViewProfile, isMobile }) {
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
        alt="Nguyễn Mai Huy Hoàng"
        src={AvatarImage}
        sx={{ width: 60, height: 60, bgcolor: "brand.main", mx: "auto", mb: 2 }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          mb: 2,
          fontSize: "16px",
        }}
      >
        Nguyễn Mai Huy Hoàng
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
