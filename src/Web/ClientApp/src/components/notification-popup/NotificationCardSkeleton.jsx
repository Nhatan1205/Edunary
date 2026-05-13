import { Box, MenuItem, Skeleton } from "@mui/material";

function NotificationCardSkeleton() {
  return (
    <MenuItem
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        padding: "16px 20px",
        cursor: "default",
      }}
    >
      <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 64,
        }}
      >
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="100%" height={16} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" height={14} />
      </Box>
    </MenuItem>
  );
}

export default NotificationCardSkeleton;
