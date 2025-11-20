import { Avatar, Box, MenuItem, Typography } from "@mui/material";
import DefaultImage from "../../assets/images/default.jpg";
import {formatTimeAgo} from "../../utils/helpers";
import useUpdateNotificationStatus from "../../hooks/useUpdateNoificationStatus";
function MessageCard({ notification }) {
  const { id, message, created, isRead } = notification;
  const updateNotificationStatusMutation = useUpdateNotificationStatus();

  function handleUpdateStatus() {
    updateNotificationStatusMutation.mutate({ id });
  }

  return (
    <MenuItem
      onClick={handleUpdateStatus}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        padding: "16px 20px",
        "&:hover": {
          backgroundColor: "background.muted",
        },
      }}
    >
      <Avatar
        src={DefaultImage}
        sx={{
          width: 64,
          height: 64,
          border: "1px solid #e0e0e0",
        }}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: 64,
          opacity: isRead ? 0.6 : 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: isRead ? 400 : 600,
            fontSize: "14px",
            color: "#1a1a1a",
            marginBottom: "4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
        >
          {message}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#757575",
            fontSize: "12px",
          }}
        >
          {formatTimeAgo(created)}
        </Typography>
      </Box>
    </MenuItem>
  );
}

export default MessageCard;
