import { useRef, useLayoutEffect } from "react";
import { Box, Avatar, Typography, Stack, CircularProgress } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import defaultAvatar from "../../assets/images/avatar.jpg";
import { formatTimeAgo } from "../../utils/helpers";



export default function MessageList({
  messages,
  recipient,
  currentUserId,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}) {
  const containerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isPrependingRef.current) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = heightDifference;
      isPrependingRef.current = false;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop } = container;
    if (scrollTop < 30 && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      prevScrollHeightRef.current = container.scrollHeight;
      isPrependingRef.current = true;
      fetchNextPage().catch(() => {
        isPrependingRef.current = false;
      });
    }
  };

  const formatMessageTime = (isoString) => {
    return formatTimeAgo(isoString) + " ago";
  };

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        p: 3,
        bgcolor: "background.alt",
        display: "flex",
        flexDirection: "column",
        gap: 2.5
      }}
    >
      {isFetchingNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <CircularProgress size={20} sx={{ color: "brand.main" }} />
        </Box>
      )}
      {messages.map((message, index) => {
        const isMe = message.senderId === currentUserId;

        // Grouping logic: consecutive messages from the same sender within 5 minutes
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
        const timeDiff = prevMessage ? (new Date(message.created).getTime() - new Date(prevMessage.created).getTime()) : 0;
        const isWithin5Mins = prevMessage && timeDiff < 5 * 60 * 1000;
        const isGrouped = isSameSender && isWithin5Mins;
        const isGroupedMessage = isSameSender && isWithin5Mins;

        return (
          <Stack
            key={message.id}
            direction={isMe ? "row-reverse" : "row"}
            spacing={1.5}
            alignItems="flex-start"
            sx={{ maxWidth: "80%", alignSelf: isMe ? "flex-end" : "flex-start" }}
          >
            {/* Avatar for incoming messages */}
            {!isMe && (
              <Box sx={{ width: 36, height: 36, mt: 0.5, flexShrink: 0 }}>
                {!isGroupedMessage && (
                  <Avatar
                    src={recipient.avatar || defaultAvatar}
                    alt={recipient.fullName}
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                    sx={{ width: 36, height: 36 }}
                  />
                )}
              </Box>
            )}

            <Stack spacing={0.5} alignItems={isMe ? "flex-end" : "flex-start"}>
              {/* Message Meta Info */}
              {!isGrouped && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "11px", px: 0.5 }}
                >
                  {formatMessageTime(message.created)}
                </Typography>
              )}

              {/* Message Bubble */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isMe ? "brand.lighter" : "background.paper",
                  color: "text.primary",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  border: isMe ? "none" : "1px solid",
                  borderColor: "divider",
                  wordBreak: "break-word",
                  fontSize: "14px"
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "14px", lineHeight: 1.5 }}>
                  {message.content}
                </Typography>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    {message.attachments.map((file, idx) => {
                      if (file.type === "image") {
                        return (
                          <Box
                            key={idx}
                            component="img"
                            src={file.url}
                            alt={file.name}
                            sx={{
                              maxWidth: "100%",
                              maxHeight: 200,
                              borderRadius: 1.5,
                              objectFit: "cover",
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: "divider"
                            }}
                          />
                        );
                      }
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1.2,
                            borderRadius: 1.5,
                            bgcolor: isMe ? "rgba(0, 167, 111, 0.08)" : "background.alt",
                            border: "1px solid",
                            borderColor: "divider",
                            gap: 1.5
                          }}
                        >
                          <InsertDriveFileIcon sx={{ color: "brand.main" }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="text.primary"
                              sx={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "10px" }}>
                              {file.size}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Stack>
        );
      })}
    </Box>
  );
}
