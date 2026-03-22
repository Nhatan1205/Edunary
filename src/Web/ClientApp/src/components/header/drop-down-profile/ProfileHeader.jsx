import { Avatar, Box, Button, Typography, CircularProgress } from "@mui/material";
import AvatarImage from "../../../assets/images/avatar.jpg";
import { Link as RouterLink } from "react-router";
import useGetBasicUserInfo from "../../../hooks/auth-hooks/useGetBasicUserInfor";

function ProfileHeader({ onViewProfile, isMobile }) {
  const { data: userInfo, isLoading } = useGetBasicUserInfo();
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
      {isLoading ? (
        <CircularProgress size={24} sx={{ my: 2 }} />
      ) : (
        <>
          <Avatar
            alt={userInfo?.fullName || userInfo?.email || "User"}
            src={userInfo?.avatar || AvatarImage}
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
            {userInfo?.fullName || userInfo?.email || "User"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 2,
              fontSize: "13px",
            }}
          >
            {userInfo?.email || ""}
          </Typography>
          <Button
            component={RouterLink}
            to={"/user/profile"}
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
        </>
      )}
    </Box>
  );
}

export default ProfileHeader;
