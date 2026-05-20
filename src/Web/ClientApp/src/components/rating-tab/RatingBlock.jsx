import { Box, Typography, Avatar, Stack, Rating, Divider } from "@mui/material";
import defaultAvatar from '../../assets/images/avatar.jpg';
import { formatTimeAgo } from '../../utils/helpers';

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch (e) {
    return iso || "";
  }
};

function RatingBlock({ name, rating = 0, modifiedAt, content, avatar, ratingResponse }) {
  return (
    <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={avatar || defaultAvatar}
            sx={{ bgcolor: "primary.main" }}
          />
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={rating} readOnly size="small" />
              <Typography sx={{ color: "#888", fontSize: 12 }}>{formatDate(modifiedAt)}</Typography>
            </Stack>
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ mt: 1 }}>
        <Typography sx={{ color: "#333" }}>{content}</Typography>
      </Box>

      {ratingResponse && (
        <Box sx={{ mt: 2, ml: 6, pl: 3, borderLeft: "2px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={ratingResponse.instructorAvatar || undefined}
              sx={{ width: 36, height: 36, bgcolor: "brand.main", fontSize: "0.875rem", fontWeight: "bold" }}
            >
              {!ratingResponse.instructorAvatar && (ratingResponse.instructorFullName ? ratingResponse.instructorFullName[0].toUpperCase() : "I")}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ratingResponse.instructorFullName || "Instructor"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Instructor response • {formatTimeAgo(ratingResponse.respondedAt)}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
              {ratingResponse.responseText}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}

export default RatingBlock;
