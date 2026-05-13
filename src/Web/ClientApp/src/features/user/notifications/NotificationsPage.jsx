import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { useState } from "react";
import MessageCard from "../../../components/notification-popup/MessageCard";
import NotificationCardSkeleton from "../../../components/notification-popup/NotificationCardSkeleton";
import CustomPagination from "../../../components/pagination/CustomPagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import useGetNotificationsByUserId from "../../../hooks/notifications-hooks/useGetNotificationByUserId";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

function NotificationsPage() {
  const [status, setStatus] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isFetching } = useGetNotificationsByUserId({
    pageNumber,
    pageSize,
    status,
  });

  const notifications = data?.list?.items ?? [];
  const totalPages = data?.list?.totalPages ?? 0;

  function handleStatusChange(nextStatus) {
    setStatus(nextStatus);
    setPageNumber(1);
  }

  function handlePageChange(event, value) {
    setPageNumber(value);
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {data?.unreadCount ?? 0} unread notifications
          </Typography>
        </Box>

        <ButtonGroup variant="outlined" aria-label="notification filters">
          {FILTERS.map((filter) => (
            <Button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              variant={status === filter.value ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
                borderColor: "brand.main",
                color: status === filter.value ? "text.inverse" : "brand.main",
                bgcolor: status === filter.value ? "brand.main" : "transparent",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor:
                    status === filter.value ? "brand.dark" : "background.muted",
                },
              }}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Divider />

      {isLoading ? (
        <Box>
          {Array.from(new Array(5)).map((_, index) => (
            <Box key={index} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <NotificationCardSkeleton />
            </Box>
          ))}
        </Box>
      ) : notifications.length > 0 ? (
        <Box sx={{ opacity: isFetching ? 0.7 : 1 }}>
          {notifications.map((notification) => (
            <Box key={notification.id} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <MessageCard notification={notification} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
            No notifications found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            New updates from your courses and learning activity will appear here.
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ mt: 3 }}>
          <CustomPagination
            count={totalPages}
            page={pageNumber}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Container>
  );
}

export default NotificationsPage;
