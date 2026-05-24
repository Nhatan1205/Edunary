import { Box, Card, Skeleton, Typography } from "@mui/material";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";

const SEGMENTS = [
  { key: "platformRevenue",       label: "Platform Revenue",     color: "#00A76F" },
  { key: "instructorGrossEarnings", label: "Instructor Earnings", color: "#8E33FF" },
  { key: "vatCollected",          label: "VAT Collected",        color: "#B78103" },
  { key: "withholdingTax",        label: "Withholding Tax",      color: "#B71D18" },
];

export default function RevenueBreakdownDonut({ summaryData, isLoading }) {
  const values = SEGMENTS.map((s) => Number(summaryData?.[s.key] ?? 0));
  const labels = SEGMENTS.map((s) => s.label);
  const colors = SEGMENTS.map((s) => s.color);

  const isEmpty = values.every((v) => v === 0);

  const chartOptions = useChart({
    colors,
    labels,
    stroke: { width: 0 },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
    },
    tooltip: {
      y: { formatter: (val) => `$${Number(val ?? 0).toFixed(2)}` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `$${total.toFixed(0)}`;
              },
            },
            value: {
              formatter: (val) => `$${Number(val).toFixed(0)}`,
            },
          },
        },
      },
    },
  });

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: "18px", border: "1px solid #F3F4F6", p: 3, height: "100%", minHeight: 340 }}>
        <Skeleton width={180} height={24} />
        <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Skeleton variant="circular" width={220} height={220} />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: "18px",
        bgcolor: "#FFFFFF",
        boxShadow: "0px 2px 12px rgba(16,24,40,0.07)",
        border: "1px solid #F3F4F6",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
          Revenue Breakdown
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
          Distribution across revenue categories
        </Typography>
      </Box>

      {isEmpty ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No revenue data available.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 260 }}>
          <Chart type="donut" series={values} options={chartOptions} sx={{ height: "100%" }} />
        </Box>
      )}
    </Card>
  );
}
