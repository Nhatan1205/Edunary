import { Avatar, Box, MenuItem, Tooltip, Typography } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useNavigate } from "react-router";
import DefaultImage from "../../assets/images/default.jpg";
import { formatTimeAgo, stripHtml } from "../../utils/helpers";
import useUpdateNotificationStatus from "../../hooks/notifications-hooks/useUpdateNotificationStatus";

function MessageCard({ notification, onAfterClick }) {
  const { id, title, message, created, isRead, imageUrl, url } = notification;
  const navigate = useNavigate();
  const updateNotificationStatusMutation = useUpdateNotificationStatus();

  function navigateToNotification() {
    if (url) {
      navigate(url);
    }

    if (onAfterClick) {
      onAfterClick();
    }
  }

  function handleUpdateStatus() {
    if (!isRead) {
      updateNotificationStatusMutation.mutate([id], {
        onSettled: navigateToNotification,
      });
      return;
    }

    navigateToNotification();
  }

  return (
    <MenuItem
      onClick={handleUpdateStatus}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        padding: "16px 20px",
        whiteSpace: "normal",
        "&:hover": {
          backgroundColor: "background.muted",
        },
      }}
    >
      <Avatar
        src={imageUrl || DefaultImage}
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
          minHeight: 64,
          opacity: isRead ? 0.6 : 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: isRead ? 400 : 600,
              fontSize: "14px",
              color: "text.primary",
              marginBottom: "4px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
            }}
          >
            {title}
          </Typography>
          {!isRead && (
            <Tooltip title="Unread">
              <FiberManualRecordIcon sx={{ fontSize: 14, color: "brand.main", flexShrink: 0, mt: 0.5 }} />
            </Tooltip>
          )}
        </Box>
        {message && (
          <Typography
            variant="body2"
            sx={{
              fontSize: "12px",
              color: "text.secondary",
              marginBottom: "4px",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
            }}
          >
            {stripHtml(message)}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            color: "text.tertiary",
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
