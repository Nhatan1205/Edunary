import { Box, Button, Divider, Menu, Typography } from "@mui/material";
import MessageCard from "./MessageCard";

function NotificationPopup({
  open,
  anchorEl,
  handleClosePopup,
  notifications,
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClosePopup}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 600,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* Header */}
      <Box sx={{ padding: "8px 20px 0 20px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "20px",
              color: "#1a1a1a",
            }}
          >
            Notifications
          </Typography>
        </Box>
      </Box>

      <Divider />
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <MessageCard key={notification.id} notification={notification} />
          ))
        ) : (
          <Typography
            sx={{
              textAlign: "center",
              padding: "16px",
              color: "text.secondary",
              fontSize: "14px",
            }}
          >
            You have no notifications
          </Typography>
        )}
      </Box>

      <Divider sx={{ marginBottom: "8px" }} />

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 20px",
          gap: "12px",
        }}
      >
        <Button
          sx={{
            flex: 1,
            color: "brand.dark",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "14px",
            padding: "6px 24px",
            "&:hover": {
              backgroundColor: "background.muted",
            },
          }}
        >
          Mark all as read
        </Button>
        <Button
          variant="outlined"
          sx={{
            flex: 1,
            color: "brand.main",
            borderColor: "brand.main",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "14px",
            padding: "6px 24px",
            "&:hover": {
              borderColor: "brand.dark",
              backgroundColor: "background.muted",
            },
          }}
          onClick={handleClosePopup}
        >
          See all
        </Button>
      </Box>
    </Menu>
  );
}

export default NotificationPopup;
