import { Box, Paper, Typography } from "@mui/material";
import LineChartWidget from "../../../../../components/charts/LineChartWidget";

export default function EnrollmentTrendPanel({ data, aggregationLevel }) {
  return (
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
          Enrollment Trend
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
          New enrollments across accessible courses
        </Typography>
      </Box>
      <LineChartWidget
        data={data}
        metric="Enrollments"
        aggregationLevel={aggregationLevel}
        height={420}
      />
    </Paper>
  );
}
