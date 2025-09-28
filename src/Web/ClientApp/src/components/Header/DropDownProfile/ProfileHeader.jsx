import { Avatar, Box, Button, Typography } from "@mui/material";

const USER_DATA = {
  name: "Nguyễn Mai Huy Hoàng",
  avatar: "/images/2.jpg",
};

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
        alt={USER_DATA.name}
        src={USER_DATA.avatar}
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
        {USER_DATA.name}
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
