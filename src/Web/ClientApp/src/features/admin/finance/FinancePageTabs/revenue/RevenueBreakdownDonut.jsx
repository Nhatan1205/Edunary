import { Box, Card, Skeleton, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";

const SEGMENTS = [
  { key: "platformRevenue",       label: "Platform Revenue",     color: "#00A76F" },
  { key: "instructorGrossEarnings", label: "Instructor Earnings", color: "#8E33FF" },
  { key: "vatCollected",          label: "VAT Collected",        color: "#B78103" },
  { key: "withholdingTax",        label: "Withholding Tax",      color: "#B71D18" },
];

export default function RevenueBreakdownDonut({ summaryData, isLoading }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const values = SEGMENTS.map((s) => Number(summaryData?.[s.key] ?? 0));
  const labels = SEGMENTS.map((s) => s.label);
  const colors = SEGMENTS.map((s) => s.color);

  const isEmpty = values.every((v) => v === 0);

  const chartOptions = useChart({
    chart: {
      id: "revenue-breakdown",
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors,
    labels,
    stroke: { width: 0 },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: isMobile ? "11px" : "12px",
      itemMargin: { horizontal: isMobile ? 6 : 8, vertical: 4 },
    },
    tooltip: {
      y: { formatter: (val) => `$${Number(val ?? 0).toFixed(2)}` },
    },
    plotOptions: {
      pie: {
        customScale: isMobile ? 0.82 : 0.9,
        donut: {
          size: isMobile ? "68%" : "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: isMobile ? "10px" : "12px",
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `$${total.toFixed(0)}`;
              },
            },
            value: {
              fontSize: isMobile ? "16px" : "20px",
              formatter: (val) => `$${Number(val).toFixed(0)}`,
            },
          },
        },
      },
    },
  });

  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: { xs: "14px", md: "18px" },
          border: "1px solid #F3F4F6",
          p: { xs: 2, md: 3 },
          height: { xs: "auto", md: "100%" },
          minHeight: { xs: 300, md: 340 },
        }}
      >
        <Skeleton width={180} height={24} />
        <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Skeleton variant="circular" width={isMobile ? 180 : 220} height={isMobile ? 180 : 220} />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: { xs: "14px", md: "18px" },
        bgcolor: "#FFFFFF",
        boxShadow: "0px 2px 12px rgba(16,24,40,0.07)",
        border: "1px solid #F3F4F6",
        p: { xs: 2, md: 3 },
        height: { xs: "auto", md: "100%" },
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
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
        <Box sx={{ flex: 1, minHeight: { xs: 210, md: 260 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No revenue data available.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: { xs: "0 0 auto", md: 1 }, height: { xs: 250, sm: 280, md: "100%" }, minHeight: { md: 260 }, minWidth: 0 }}>
          <Chart type="donut" series={values} options={chartOptions} sx={{ height: "100%" }} />
        </Box>
      )}
    </Card>
  );
}
