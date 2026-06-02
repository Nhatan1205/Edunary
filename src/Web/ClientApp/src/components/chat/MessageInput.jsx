import React, { useState } from "react";
import { Box, InputBase, IconButton } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

export default function MessageInput({ onSendMessage, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.5
      }}
    >
      {/* Input Field */}
      <InputBase
        fullWidth
        disabled={disabled}
        placeholder={disabled ? "Conversation is blocked" : "Type a message..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: "background.alt",
          fontSize: "14px",
          color: "text.primary"
        }}
      />

      {/* Send Button */}
      <IconButton
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        sx={{
          bgcolor: text.trim() && !disabled ? "brand.main" : "transparent",
          color: text.trim() && !disabled ? "white" : "text.disabled",
          "&:hover": {
            bgcolor: text.trim() && !disabled ? "brand.dark" : "transparent"
          },
          transition: "all 0.2s"
        }}
      >
        <SendRoundedIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
}
