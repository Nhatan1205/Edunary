import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import RatingBlock from "./RatingBlock";

function ReviewsList({ reviews = [] }) {
  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: "#666" }}>No suitable reviews found.</Typography>
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
          ratingResponse={r.ratingResponse}
        />
      ))}
    </Stack>
  );
}

export default ReviewsList;
