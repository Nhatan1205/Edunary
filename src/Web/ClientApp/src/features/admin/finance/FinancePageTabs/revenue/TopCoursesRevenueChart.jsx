import { useState } from "react";
import { Box, Card, Skeleton, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";
import useGetTopCoursesByRevenue from "../../../../../hooks/finance-hooks/useGetTopCoursesByRevenue";
import { FinanceDateRange } from "../shared";

export default function TopCoursesRevenueChart() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const { data: courses, isLoading } = useGetTopCoursesByRevenue(from, to, 10);

  const list = courses ?? [];
  const chartHeight = Math.max(isMobile ? 260 : 220, list.length * (isMobile ? 48 : 44));

  const chartOptions = useChart({
    chart: {
      id: "top-courses-revenue",
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors: ["#1890FF"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: isMobile ? "48%" : "56%",
      },
    },
    xaxis: {
      categories: list.map((c) => c.courseName ?? ""),
      labels: {
        style: { fontSize: isMobile ? "10px" : "11px" },
        formatter: (val) => `$${Number(val ?? 0).toFixed(0)}`,
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: isMobile ? "10px" : "11px" },
        maxWidth: isMobile ? 92 : 180,
      },
    },
    tooltip: {
      y: { formatter: (val) => `$${Number(val ?? 0).toFixed(2)}` },
    },
    grid: {
      strokeDashArray: 3,
      padding: { left: isMobile ? -8 : 0, right: isMobile ? 6 : 0 },
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  });

  const series = [{ name: "Revenue", data: list.map((c) => Number(c.totalRevenue ?? 0)) }];

  if (isLoading) {
    return (
      <Card
        sx={{
          borderRadius: { xs: "14px", md: "18px" },
          border: "1px solid #F3F4F6",
          p: { xs: 2, md: 3 },
          height: { xs: "auto", md: "100%" },
          minHeight: { xs: 320, md: 340 },
        }}
      >
        <Skeleton width={200} height={24} />
        <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
        <Skeleton variant="rectangular" sx={{ mt: 2, borderRadius: 2 }} height={isMobile ? 250 : 240} />
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
            Top Courses by Revenue
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
            Highest-earning courses ranked by gross sales
          </Typography>
        </Box>

        <Box sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 0 }}>
          <FinanceDateRange
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </Box>
      </Box>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, minHeight: { xs: 220, md: 240 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No completed orders found for the selected period.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: chartHeight, minWidth: 0 }}>
          <Chart type="bar" series={series} options={chartOptions} sx={{ height: "100%" }} />
        </Box>
      )}
    </Card>
  );
}
