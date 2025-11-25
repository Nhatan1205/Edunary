import React from "react";
import { Box, Typography, Avatar, Stack, Rating, Divider } from "@mui/material";

const initialsFromName = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.map((p) => p[0]).slice(0, 2).join("");
  return initials.toUpperCase();
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch (e) {
    return iso || "";
  }
};

function RatingBlock({ name, rating = 0, modifiedAt, content, avatar }) {
  return (
    <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={avatar} 
            sx={{ bgcolor: "primary.main" }}
          >
            {!avatar && initialsFromName(name)}
          </Avatar>
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
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}

export default RatingBlock;
