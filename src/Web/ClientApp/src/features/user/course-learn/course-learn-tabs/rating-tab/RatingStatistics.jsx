import React from "react";
import { Box, Typography, Stack, Rating, LinearProgress } from "@mui/material";

function RatingStatistics({ reviews = [] }) {
  const total = reviews.length;
  console.log('reviews', reviews);
  
  // Tính số lượng và phần trăm cho mỗi mức rating
  const getRatingData = (starValue) => {
    const count = reviews.filter((r) => Math.round(r.rating) === starValue).length;
    const percentage = total === 0 ? 0 : (count / total) * 100;
    return { count, percentage };
  };

  // Tính rating trung bình
  const avg = total === 0 ? 0 : reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / total;

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: (theme) => theme.palette.background.paper, borderRadius: 2 }}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={4} 
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        {/* Left side - Rating Summary */}
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minWidth: { xs: '100%', md: 250 },
            flex: { xs: 'none', md: '0 0 auto' }
          }}
        >
          <Typography sx={{ fontSize: 56, fontWeight: 700, color: (theme) => theme.palette.brand.main, mb: 1 }}>
            {avg.toFixed(1)}
          </Typography>
          <Rating value={avg} precision={0.1} readOnly size="large" sx={{ mb: 1 }} />
          <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontSize: 16, fontWeight: 500 }}>
            Course Rating
          </Typography>
          <Typography sx={{ color: (theme) => theme.palette.text.disabled, fontSize: 14, mt: 0.5 }}>
            {total} {total === 1 ? 'review' : 'reviews'}
          </Typography>
        </Box>
        
        {/* Right side - Rating Bars */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const { count, percentage } = getRatingData(star);
              
              return (
                <Stack key={star} direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  <Typography sx={{ minWidth: 40, fontSize: 15, fontWeight: 600, color: "text.primary" }}>
                    {star}★
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        width: '100%',
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: "#e0e0e0",
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: "brand.main",
                        }
                      }}
                    />
                  </Box>
                  <Typography sx={{ 
                    minWidth: 60, 
                    textAlign: "right", 
                    fontSize: 15, 
                    fontWeight: 600,
                    color: percentage > 0 ? "brand.main" : "text.disabled"
                  }}>
                    {Math.round(percentage)}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default RatingStatistics;
