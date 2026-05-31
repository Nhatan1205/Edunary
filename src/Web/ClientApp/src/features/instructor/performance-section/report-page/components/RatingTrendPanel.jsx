import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import LineChartWidget from "../../../../../components/charts/LineChartWidget";
import NoData from "../../../../../components/NoData";
import emptyAnalyticsImg from "../../../../../assets/images/empty-analytics.png";

export default function RatingTrendPanel({ ratingData, ratingCountData, aggregationLevel, totalRatings }) {
  const hasRatings = Number(totalRatings ?? 0) > 0;

  if (!hasRatings) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          minHeight: { xs: 320, md: 380 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NoData
          image={emptyAnalyticsImg}
          title="No rating data available"
          description="Ratings submitted in the selected range will appear here."
          minHeight="220px"
        />
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
              Average Rating Trend
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
              Average rating from reviews created in the selected range
            </Typography>
          </Box>
          <Chip
            label={`${Number(totalRatings ?? 0).toLocaleString("en-US")} rating${Number(totalRatings ?? 0) === 1 ? "" : "s"}`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>
        <LineChartWidget
          data={ratingData}
          metric="Average Rating"
          aggregationLevel={aggregationLevel}
          height={360}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
            Rating Count Trend
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
            Number of ratings submitted over time
          </Typography>
        </Box>
        <LineChartWidget
          data={ratingCountData}
          metric="Ratings"
          aggregationLevel={aggregationLevel}
          height={360}
        />
      </Paper>
    </Stack>
  );
}
