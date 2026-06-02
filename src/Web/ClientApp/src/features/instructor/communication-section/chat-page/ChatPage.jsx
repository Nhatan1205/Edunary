import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Stack, 
  IconButton, 
  Avatar, 
  useMediaQuery,
  Button,
  CircularProgress,
  Skeleton
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import useDebounce from "../../../../hooks/common/useDebounce";

import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import NoData from "../../../../components/NoData";
import ConversationListPanel from "../../../../components/chat/ConversationListPanel";
import MessageList from "../../../../components/chat/MessageList";
import MessageInput from "../../../../components/chat/MessageInput";
import ContactInfoSidebar from "../../../../components/chat/ContactInfoSidebar";
import DirectMessagesToolbar from "./components/DirectMessagesToolbar";

import useConversationRealtime from "../../../../hooks/dm-hooks/useConversationRealtime";
import useGetConversations from "../../../../hooks/dm-hooks/useGetConversations";
import useGetConversationMessages from "../../../../hooks/dm-hooks/useGetConversationMessages";
import useSendMessage from "../../../../hooks/dm-hooks/useSendMessage";
import useCreateConversation from "../../../../hooks/dm-hooks/useCreateConversation";
import useSearchUsers from "../../../../hooks/dm-hooks/useSearchUsers";
import useGetBasicUserInfo from "../../../../hooks/auth-hooks/useGetBasicUserInfor";
import queryClient from "../../../../configs/reactQuery.js";

import chatEmptyImg from "../../../../assets/images/chat_empty.png";
import defaultAvatar from "../../../../assets/images/avatar.jpg";

export default function ChatPage() {
  return <ChatPageContent />;
}

function ChatPageContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("id");

  // Get current user information
  const { data: currentUser } = useGetBasicUserInfo();
  const currentUserId = currentUser?.userId;
  const currentUserAvatar = currentUser?.avatar;

  // Filtering & Sorting State
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("newestFirst");
  const [filters, setFilters] = useState({
    unread: false,
    important: false,
    notAnswered: false,
  });

  const [recipientSearchText, setRecipientSearchText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isSmall = useMediaQuery("(max-width:900px)");

  // Debounce search values
  const debouncedSearchText = useDebounce(searchText, 500);
  const debouncedRecipientSearchText = useDebounce(recipientSearchText, 500);

  // Derive filter value for API
  const apiFilter = useMemo(() => {
    if (filters.unread) return "unread";
    if (filters.important) return "important";
    if (filters.notAnswered) return "not_answered";
    return undefined;
  }, [filters]);

  // Fetch Conversations list using real hook
  const { data: conversationsData, isLoading: isConversationsLoading } = useGetConversations({
    pageNumber: 1,
    pageSize: 100,
    filter: apiFilter,
    sortBy: sortBy === "oldestFirst" ? "oldest" : "newest",
    searchText: debouncedSearchText || undefined
  });
  const conversations = conversationsData?.items || [];

  // Fetch Messages for active conversation
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading
  } = useGetConversationMessages(activeId ? Number(activeId) : null);

  const activeMessages = useMemo(() => {
    if (!messagesData) return [];
    const allMessages = messagesData.pages.flatMap((page) => page.items || []);
    return [...allMessages].reverse();
  }, [messagesData]);

  // Mutations
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();

  // Search users for new chat
  const { data: searchResults } = useSearchUsers(debouncedRecipientSearchText);

  // Sum of unread counts
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  const conversationIds = useMemo(() => conversations.map((c) => c.id), [conversations]);
  useConversationRealtime(conversationIds, activeId ? Number(activeId) : null);

  // Find currently active conversation
  const activeConversation = useMemo(() => {
    return conversations.find(c => String(c.id) === String(activeId));
  }, [conversations, activeId]);

  // Handle active conversation selection
  const handleSelectConversation = (id) => {
    setSearchParams({ id });
  };

  const handleNewChat = () => {
    setSearchParams({});
    setRecipientSearchText("");
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Handle sending new messages
  const handleSendMessage = (text) => {
    if (!activeId) return;
    sendMessageMutation.mutate({ conversationId: Number(activeId), content: text });
  };

  return (
    <MainCard>
      {/* Page Header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <PageTitle title="Chat" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            You have {totalUnreadCount} unread messages.
          </Typography>
        </Box>
      </Stack>

      {/* Direct Messages Toolbar (Sort By, Checkboxes) */}
      <DirectMessagesToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* 2-Panel Layout */}
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 240px)",
          minHeight: 650,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Left Conversation List Panel */}
         <Box
          sx={{
            width: isSmall ? "100%" : "300px",
            flexShrink: 0,
            display: isSmall && activeId ? "none" : "block",
            borderRight: "1px solid",
            borderColor: "divider",
            height: "100%",
          }}
        >
          <ConversationListPanel
            conversations={conversations}
            selectedId={activeId}
            onSelectConversation={handleSelectConversation}
            searchText={searchText}
            onSearchChange={setSearchText}
            onNewChat={handleNewChat}
            currentUser={currentUser}
            isLoading={isConversationsLoading}
          />
        </Box>

        {/* Right Chat Panel / Area */}
        <Box
          sx={{
            flex: 1,
            display: isSmall && !activeId ? "none" : "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100%",
          }}
        >
          {activeId ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
              {/* Chat Header */}
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {isSmall && (
                    <Button 
                      variant="text" 
                      onClick={() => setSearchParams({})} 
                      sx={{ minWidth: 0, px: 1, color: "brand.main", fontWeight: 700 }}
                    >
                      Back
                    </Button>
                  )}
                  {isConversationsLoading ? (
                    <>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={60} height={14} sx={{ mt: 0.5 }} />
                      </Box>
                    </>
                  ) : activeConversation ? (
                    <>
                      <Box sx={{ position: "relative" }}>
                        <Avatar 
                          src={activeConversation.recipient?.avatar || defaultAvatar} 
                          alt={activeConversation.recipient?.fullName} 
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                        {activeConversation.recipient?.online && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "success.main",
                              border: "1.5px solid",
                              borderColor: "background.paper",
                            }}
                          />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                          {activeConversation.recipient?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activeConversation.recipient?.online ? "online" : "offline"}
                        </Typography>
                      </Box>
                    </>
                  ) : null}
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <IconButton 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{ color: sidebarOpen ? "brand.main" : "text.secondary" }}
                  >
                    {sidebarOpen ? <ChevronRightIcon sx={{ fontSize: 20 }} /> : <ChevronLeftIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                  <IconButton sx={{ color: "text.secondary" }}><MoreVertIcon sx={{ fontSize: 20 }} /></IconButton>
                </Stack>
              </Box>

              {/* Lower Body: Messages + Sidebar */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "row", minWidth: 0, overflow: "hidden" }}>
                {isMessagesLoading ? (
                  <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : activeConversation ? (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
                    {/* Message List */}
                    <MessageList 
                      messages={activeMessages} 
                      recipient={activeConversation.recipient} 
                      currentUserId={currentUserId}
                      fetchNextPage={fetchNextPage}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                    />

                    {/* Message Input */}
                    <MessageInput 
                      onSendMessage={handleSendMessage}
                      disabled={activeConversation.isBlocked}
                    />
                  </Box>
                ) : null}

                {/* Sidebar with info details */}
                {sidebarOpen && !isSmall && activeConversation?.recipient && (
                  <ContactInfoSidebar 
                    recipient={activeConversation.recipient} 
                  />
                )}
              </Box>
            </Box>
          ) : (
          /* Empty Chat / New Chat state with "To:" header (Image 1 Mockup) */
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
            {/* "To: + Recipients" Header Panel */}
            <Box 
              sx={{ 
                px: 3, 
                py: 2, 
                borderBottom: "1px solid", 
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2
              }}
            >
              <Typography variant="body2" fontWeight={700} color="text.primary">
                To:
              </Typography>
              <Box
                sx={{ position: "relative", width: "100%", maxWidth: 240 }}
              >
                <Box 
                  component="input" 
                  placeholder="+ Recipients"
                  value={recipientSearchText}
                  onChange={(e) => setRecipientSearchText(e.target.value)}
                  sx={{ 
                    outline: "none",
                    border: "1px solid", 
                    borderColor: "rgba(145, 158, 171, 0.24)", 
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.75,
                    fontSize: "13px",
                    color: "text.primary",
                    width: "100%",
                    bgcolor: "transparent",
                    fontFamily: "inherit",
                    "&:focus": {
                      borderColor: "brand.main"
                    }
                  }}
                />
                 {recipientSearchText && searchResults && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 10,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      maxHeight: 200,
                      overflowY: "auto",
                      mt: 0.5
                    }}
                  >
                    {searchResults.map((u) => (
                      <Box
                        key={u.id}
                        onClick={async () => {
                          setRecipientSearchText("");
                          const res = await createConversationMutation.mutateAsync(u.id);
                          if (res && res.result > 0) {
                            setSearchParams({ id: res.result });
                          }
                        }}
                        sx={{
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          "&:hover": {
                            bgcolor: "action.hover"
                          }
                        }}
                      >
                        <Avatar 
                          src={u.avatar || defaultAvatar} 
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                          sx={{ width: 24, height: 24 }} 
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {u.fullName}
                        </Typography>
                      </Box>
                    ))}
                    {searchResults.length === 0 && (
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          No contacts found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {/* NoData Empty State illustration */}
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.alt" }}>
              <NoData
                image={chatEmptyImg}
                title="Good morning!"
                description="Write something awesome... Select a conversation from the list to start messaging."
                imageWidth={160}
                minHeight="300px"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  </MainCard>
  );
}
