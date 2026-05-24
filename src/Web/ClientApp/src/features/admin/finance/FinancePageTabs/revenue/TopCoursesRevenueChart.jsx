import { useState } from "react";
import { Box, Card, Skeleton, Typography } from "@mui/material";
import { useChart } from "../../../../../hooks/common/useChart";
import Chart from "../../../../../components/charts/Chart";
import useGetTopCoursesByRevenue from "../../../../../hooks/finance-hooks/useGetTopCoursesByRevenue";
import { FinanceDateRange } from "../shared";

export default function TopCoursesRevenueChart() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const { data: courses, isLoading } = useGetTopCoursesByRevenue(from, to, 10);

  const list = courses ?? [];
  const chartHeight = Math.max(220, list.length * 44);

  const chartOptions = useChart({
    chart: { id: "top-courses-revenue" },
    colors: ["#1890FF"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    xaxis: {
      categories: list.map((c) => c.courseName ?? ""),
      labels: {
        style: { fontSize: "11px" },
        formatter: (val) => `$${Number(val ?? 0).toFixed(0)}`,
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px" },
        maxWidth: 180,
      },
    },
    tooltip: {
      y: { formatter: (val) => `$${Number(val ?? 0).toFixed(2)}` },
    },
    grid: {
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  });

  const series = [{ name: "Revenue", data: list.map((c) => Number(c.totalRevenue ?? 0)) }];

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: "18px", border: "1px solid #F3F4F6", p: 3, height: "100%", minHeight: 340 }}>
        <Skeleton width={200} height={24} />
        <Skeleton width={140} height={18} sx={{ mt: 0.5 }} />
        <Skeleton variant="rectangular" sx={{ mt: 2, borderRadius: 2 }} height={240} />
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
            Top Courses by Revenue
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
            Highest-earning courses ranked by gross sales
          </Typography>
        </Box>

        <FinanceDateRange
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </Box>

      {list.length === 0 ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No completed orders found for the selected period.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: chartHeight }}>
          <Chart type="bar" series={series} options={chartOptions} sx={{ height: "100%" }} />
        </Box>
      )}
    </Card>
  );
}
