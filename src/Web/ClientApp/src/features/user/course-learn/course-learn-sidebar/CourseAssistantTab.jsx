import {
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress
} from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import NoData from "../../../../components/NoData";
import useGetCourseAssistantHistory from "../../../../hooks/course-assistant-hooks/useGetCourseAssistantHistory";
import useSendCourseAssistantMessage from "../../../../hooks/course-assistant-hooks/useSendCourseAssistantMessage";
import { useSignalR } from "../../../../hooks/common/useSignalR";
import { tokenService } from "../../../../utils/tokenService";
import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";

function CourseAssistantTab({ courseId, contentId, courseContents }) {
  const [localMessages, setLocalMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const { data: historyData, isLoading: isHistoryLoading } = useGetCourseAssistantHistory(
    Number(courseId),
    null,
    50,
    true
  );

  const sendMessageMutation = useSendCourseAssistantMessage();
  const { on } = useSignalR();
  const userId = tokenService.getUserId();

  const messagesContainerRef = useRef(null);

  // Set messages from history when loaded
  useEffect(() => {
    if (historyData?.result?.items) {
      const chronological = [...historyData.result.items].reverse();
      setLocalMessages(chronological);
    }
  }, [historyData]);

  // Listen for SignalR replies
  useEffect(() => {
    if (!userId) return;

    const cleanup = on(`CourseAssistant.Reply:${userId}`, (data) => {
      if (data && Number(data.courseId) === Number(courseId)) {
        setLocalMessages(prev => {
          const newMsgs = [...prev];
          let lastIdx = -1;
          for (let i = newMsgs.length - 1; i >= 0; i--) {
            if (newMsgs[i].role === "assistant" && newMsgs[i].isLoading) {
              lastIdx = i;
              break;
            }
          }
          if (lastIdx !== -1) {
            newMsgs[lastIdx] = {
              ...newMsgs[lastIdx],
              id: data.id || `ai-${Date.now()}`,
              content: data.reply || data.message || "An error occurred.",
              sources: data.sources || null,
              isLoading: false,
              isError: !data.success
            };
          } else {
            newMsgs.push({
              id: data.id || `ai-${Date.now()}`,
              role: "assistant",
              content: data.reply || data.message || "An error occurred.",
              sources: data.sources || null,
              createdAt: new Date().toISOString()
            });
          }
          return newMsgs;
        });
      }
    });

    return cleanup;
  }, [userId, on, courseId]);

  // Safe container-only scrolling (fixes parent/sibling scroll bug)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue("");

    // Find current content info
    const currentItem = courseContents
      .flatMap(section => section.items || [])
      .find(item => item.itemId === contentId);

    const contentTitle = currentItem?.title || "";
    const contentType = currentItem?.type || "lecture";
    const mediaType = currentItem?.contentType || "";

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString()
    };

    const pendingAssistantMsg = {
      id: `ai-pending-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
      createdAt: new Date().toISOString()
    };

    setLocalMessages(prev => [...prev, userMsg, pendingAssistantMsg]);

    try {
      await sendMessageMutation.mutateAsync({
        courseId: Number(courseId),
        contentId: contentId || "",
        contentType: contentType,
        mediaType: mediaType,
        contentTitle: contentTitle,
        message: messageText
      });
    } catch (err) {
      setLocalMessages(prev => {
        const newMsgs = [...prev];
        let lastIdx = -1;
        for (let i = newMsgs.length - 1; i >= 0; i--) {
          if (newMsgs[i].role === "assistant" && newMsgs[i].isLoading) {
            lastIdx = i;
            break;
          }
        }
        if (lastIdx !== -1) {
          newMsgs[lastIdx] = {
            ...newMsgs[lastIdx],
            content: "Failed to send message. Please try again.",
            isLoading: false,
            isError: true
          };
        }
        return newMsgs;
      });
    }
  };

  // Group messages helper
  const groupMessagesByDate = (msgList) => {
    const groups = {};
    msgList.forEach((msg) => {
      let dateStr = "Today";
      if (msg.createdAt) {
        try {
          const date = new Date(msg.createdAt);
          dateStr = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
        } catch {
          dateStr = "Recent";
        }
      }
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(msg);
    });
    return groups;
  };

  const renderMessageContent = (content) => {
    if (!content) return { __html: "" };
    let html = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
    return { __html: DOMPurify.sanitize(html) };
  };

  const groupedMessages = groupMessagesByDate(localMessages);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "background.paper" }}>
      {isHistoryLoading && localMessages.length === 0 ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : localMessages.length === 0 ? (
        <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
          {/* Overrides NoData header and desc sizes, pulls it to top */}
          <Box
            sx={{
              width: "100%",
              mt: 2,
              "& > div": {
                justifyContent: "flex-start",
                p: 1,
                minHeight: "auto"
              },
              "& .MuiTypography-h5": {
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "text.primary",
                mt: 1,
                textAlign: "center"
              },
              "& .MuiTypography-body1": {
                fontSize: "0.75rem",
                color: "text.secondary",
                mt: 0.5,
                textAlign: "center"
              }
            }}
          >
            <NoData
              title="Do you have any questions about this course?"
              description="Our AI assistant may make mistakes. Verify for accuracy."
              minHeight="auto"
            />
          </Box>
        </Box>
      ) : (
        /* Message Thread */
        <Box
          ref={messagesContainerRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            scrollBehavior: "smooth",
            bgcolor: "background.surface",
            // custom thin scrollbar like chat_new.html
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "divider" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 2 },
            "&::-webkit-scrollbar-thumb:hover": { bgcolor: "grey.500" }
          }}
        >
          {Object.keys(groupedMessages).map((date) => (
            <Box key={date}>
              {/* Date Divider */}
              <Box sx={{ display: "flex", alignItems: "center", my: 2.5 }}>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                <Typography variant="caption" sx={{ color: "text.secondary", px: 1.5, fontWeight: 600, fontSize: "0.75rem" }}>
                  {date}
                </Typography>
                <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              </Box>

              {/* Messages */}
              {groupedMessages[date].map((msg) => (
                <Box key={msg.id}>
                  {msg.role === "user" ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                      <Box
                        sx={{
                          maxWidth: "80%",
                          background: "linear-gradient(135deg, #00A76F, #007867)", // brand gradient from chat.css
                          color: "#F7FBFA",
                          p: "0.85rem 1.1rem",
                          borderRadius: "16px",
                          borderBottomRightRadius: "6px",
                          boxShadow: "0 2px 8px rgba(0, 167, 111, 0.2)"
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          dangerouslySetInnerHTML={renderMessageContent(msg.content)}
                          sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "inherit", lineHeight: 1.5 }} 
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "flex-start" }}>
                      <Avatar
                        sx={{
                          width: 24, // shrunken avatar
                          height: 24,
                          bgcolor: "brand.main",
                          color: "white"
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 13 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            maxWidth: "85%",
                            bgcolor: "#F4F7F6", // bot background from chat.css
                            color: "#0F2B2A",
                            border: "1px solid #EFF7F6",
                            p: "0.85rem 1.1rem",
                            borderRadius: "16px",
                            borderBottomLeftRadius: "6px",
                            boxShadow: "0 1px 4px rgba(15, 43, 42, 0.08)"
                          }}
                        >
                          {msg.isLoading ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CircularProgress size={12} color="primary" />
                              <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", fontSize: "0.85rem" }}>
                                AI is writing...
                              </Typography>
                            </Box>
                          ) : (
                            <Typography 
                              variant="body2" 
                              dangerouslySetInnerHTML={renderMessageContent(msg.content)}
                              sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.5 }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}

      {/* Input container styled like chat_new.html input-field and send-button */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          component="input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question"
          disabled={sendMessageMutation.isPending}
          sx={{
            flex: 1,
            border: "2px solid #EFF7F6",
            borderRadius: "20px",
            px: 2,
            height: "40px",
            fontSize: "14px",
            outline: "none",
            bgcolor: "#FCFFFE",
            color: "#0F2B2A",
            transition: "border-color 0.2s ease",
            "&:focus": {
              borderColor: "brand.main",
              boxShadow: "0 0 0 3px rgba(0, 167, 111, 0.1)"
            }
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!inputValue.trim() || sendMessageMutation.isPending}
          sx={{
            background: "linear-gradient(135deg, #00A76F, #007867)",
            color: "white",
            width: "40px",
            height: "40px",
            borderRadius: "20px",
            p: 0,
            "&:hover": {
              background: "linear-gradient(135deg, #007867, #004B50)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(63, 204, 178, 0.4)"
            },
            "&.Mui-disabled": {
              background: "#9CB8B6",
              color: "white",
              opacity: 0.8
            }
          }}
        >
          <ArrowUpwardIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default CourseAssistantTab;
