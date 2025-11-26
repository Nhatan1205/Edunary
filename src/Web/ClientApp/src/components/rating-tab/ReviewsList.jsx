import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import RatingBlock from "./RatingBlock";

function ReviewsList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#666" }}>Không có đánh giá phù hợp.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {reviews.map((r) => (
        <RatingBlock
          key={r.id}
          name={r.name}
          rating={r.rating}
          modifiedAt={r.modifiedAt}
          content={r.content}
          avatar={r.avatar}
        />
      ))}
    </Stack>
  );
}

export default ReviewsList;
