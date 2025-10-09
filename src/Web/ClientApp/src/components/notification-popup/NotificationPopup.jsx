import { Box, Button, Divider, Menu, Typography } from "@mui/material";
import MessageCard from "./MessageCard";
import { useSignalR } from "../../context/SignalRContext";
function NotificationPopup({ open, anchorEl, handleClosePopup }) {
  // const notifications = [
  //   {
  //     id: 1,
  //     title: "The quiz that you requested to be deleted is now deleted.",
  //     timestamp: "4 days ago",
  //   },
  //   {
  //     id: 2,
  //     title: "The assignment that you requested to be deleted is now deleted.",
  //     timestamp: "4 days ago",
  //   },
  //   {
  //     id: 3,
  //     title:
  //       "The quiz that you requested to be deleted is now deleted. The quiz that you requested to be deleted is now deleted.",
  //     timestamp: "4 days ago",
  //   },
  // ];

  const { notifications } = useSignalR();

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

      {/* Notification List */}
      <Box sx={{ maxHeight: 400 }}>
        {notifications.map((notification) => (
          <MessageCard
            key={notification.id}
            title={notification.title}
            timestamp={notification.timestamp}
            onClick={handleClosePopup}
          />
        ))}
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
