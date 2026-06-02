import React from "react";
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Typography, 
  Stack, 
  Avatar,
  IconButton,
  Divider,
  List,
  Skeleton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ConversationItem from "./ConversationItem";
import defaultAvatar from "../../assets/images/avatar.jpg";

export default function ConversationListPanel({
  conversations,
  selectedId,
  onSelectConversation,
  searchText,
  onSearchChange,
  onNewChat, // Callback to go to default new chat screen
  currentUser,
  isLoading
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
      {/* Top Header of Sidebar */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ position: "relative" }}>
          {isLoading || !currentUser ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <>
              <Avatar 
                src={currentUser?.avatar || defaultAvatar} 
                alt={currentUser?.fullName}
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
                sx={{ width: 40, height: 40 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  border: "1.5px solid",
                  borderColor: "background.paper",
                }}
              />
            </>
          )}
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onNewChat}>
            <PersonAddAlt1Icon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Search Input inside Sidebar */}
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search contacts..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.alt",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": { borderColor: "brand.main" },
              fontSize: "13px"
            },
          }}
        />
      </Box>

      <Divider />

      {/* Conversations List */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Stack spacing={2} sx={{ p: 2.5 }}>
            {[...Array(5)].map((_, index) => (
              <Stack key={index} direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="80%" height={16} sx={{ mt: 0.5 }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No conversations found
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={selectedId == conv.id}
                onClick={() => onSelectConversation(conv.id)}
                currentUserId={currentUser?.userId}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
