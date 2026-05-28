import { useState } from "react";
import {
  Box, Card, FormControl, MenuItem, Select, Skeleton, Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";
import useGetRevenueTrend from "../../../../../hooks/finance-hooks/useGetRevenueTrend";

const RANGE_OPTIONS = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m",  label: "Last 3 months" },
  { value: "12m", label: "Last 12 months" },
];

const selectSx = {
  fontSize: "0.8rem",
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
};

export default function RevenueTrendChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [range, setRange] = useState("30d");
  const { data, isLoading } = useGetRevenueTrend(range);

  const labels   = data?.labels ?? [];
  const hasManyLabels = labels.length > (isMobile ? 5 : 10);
  const series = [
    { name: "Gross Sales",       data: data?.grossSales ?? [] },
    { name: "Platform Revenue",  data: data?.platformRevenue ?? [] },
  ];

  const chartOptions = useChart({
    chart: {
      id: "revenue-trend",
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors: ["#1890FF", "#00A76F"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.3,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    stroke: { width: 2.5, curve: "smooth" },
    xaxis: {
      categories: labels,
      tickAmount: hasManyLabels ? (isMobile ? 4 : 8) : undefined,
      labels: {
        rotate: hasManyLabels ? -35 : 0,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        style: { fontSize: isMobile ? "9px" : "11px" },
      },
    },
    yaxis: {
      tickAmount: isMobile ? 4 : 5,
      labels: {
        offsetX: isMobile ? -6 : 0,
        style: { fontSize: isMobile ? "10px" : "11px" },
        formatter: (val) => `$${Number(val ?? 0).toFixed(0)}`,
      },
    },
    tooltip: {
      x: { show: true },
      y: { formatter: (val) => `$${Number(val ?? 0).toFixed(2)}` },
    },
    grid: {
      strokeDashArray: 3,
      padding: { left: isMobile ? -4 : 0, right: isMobile ? 4 : 0, bottom: 0 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
      position: isMobile ? "bottom" : "top",
      horizontalAlign: isMobile ? "left" : "right",
      fontSize: isMobile ? "11px" : "13px",
      itemMargin: { horizontal: isMobile ? 6 : 8, vertical: isMobile ? 4 : 8 },
    },
  });

  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: { xs: "14px", md: "18px" },
          border: "1px solid #F3F4F6",
          p: { xs: 2, md: 3 },
          minHeight: { xs: 330, md: 380 },
        }}
      >
        <Skeleton width={200} height={24} />
        <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
        <Skeleton variant="rectangular" sx={{ mt: 2, borderRadius: 2 }} height={isMobile ? 230 : 280} />
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
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 1.5,
          mb: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
            Revenue Trend
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
            Gross sales and platform revenue over time
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 140 }, width: { xs: "100%", sm: "auto" } }}>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            sx={selectSx}
          >
            {RANGE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem" }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {labels.length === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: { xs: 230, md: 280 } }}>
          <Typography variant="body2" color="text.secondary">
            No revenue data for the selected period.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: { xs: 250, sm: 280, md: 300 }, minWidth: 0 }}>
          <Chart type="area" series={series} options={chartOptions} sx={{ height: "100%" }} />
        </Box>
      )}
    </Card>
  );
}
