import { Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import MetricCard from "./MetricCard";

export default function ReportSummary({ summaryCards, selectedCourseLabel, coursesLoading, courseCount }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
            Summary
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
            {selectedCourseLabel} - Selected range
          </Typography>
        </Box>

        <Chip
          icon={<InsertChartOutlinedIcon sx={{ fontSize: 16 }} />}
          label={coursesLoading ? "Loading courses..." : `${courseCount} accessible course${courseCount === 1 ? "" : "s"}`}
          variant="outlined"
        />
      </Stack>

      <Grid container spacing={2}>
        {summaryCards.map(({ key, ...card }) => (
          <Grid item xs={12} sm={6} lg={3} key={key}>
            <MetricCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
