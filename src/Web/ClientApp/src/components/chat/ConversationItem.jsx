import { Box, Avatar, Typography, Badge, Stack } from "@mui/material";
import { formatTimeAgo } from "../../utils/helpers";
import defaultAvatar from "../../assets/images/avatar.jpg";

export default function ConversationItem({ conversation, active, onClick, currentUserId }) {
  const { recipient, lastMessage, unreadCount, lastMessageAt } = conversation;

  // Format message preview
  const getPreviewText = () => {
    if (!lastMessage) return "No messages yet";
    const prefix = lastMessage.senderId === currentUserId ? "You: " : "";
    return `${prefix}${lastMessage.content}`;
  };

  const formattedTime = formatTimeAgo(lastMessageAt);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2.5,
        py: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        bgcolor: active ? "action.selected" : "transparent",
        position: "relative",
        "&:hover": {
          bgcolor: active ? "action.selected" : "action.hover",
        },
      }}
    >
      <Box sx={{ position: "relative", mr: 2, flexShrink: 0 }}>
        <Avatar
          src={recipient.avatar || defaultAvatar}
          alt={recipient.fullName}
          onError={(e) => {
            e.target.src = defaultAvatar;
          }}
          sx={{ width: 44, height: 44 }}
        />
        {recipient.online && (
          <Box
            sx={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "success.main",
              border: "2px solid",
              borderColor: "background.paper",
            }}
          />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: unreadCount > 0 ? 700 : 600,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {recipient.fullName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              whiteSpace: "nowrap",
              fontSize: "11px",
              ml: 1
            }}
          >
            {formattedTime}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body2"
            sx={{
              color: unreadCount > 0 ? "text.primary" : "text.secondary",
              fontWeight: unreadCount > 0 ? 600 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "13px"
            }}
          >
            {getPreviewText()}
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                ml: 1,
                minWidth: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "error.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                px: 0.5,
                lineHeight: 1,
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
