import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Chart from "../../../../../components/charts/Chart";
import NoData from "../../../../../components/NoData";
import emptyAnalyticsImg from "../../../../../assets/images/empty-analytics.png";
import { useChart } from "../../../../../hooks/common/useChart";

export default function RevenueTrendPanel({ data, aggregationLevel }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatLabel = (dateValue) => {
    const date = new Date(dateValue);
    if (aggregationLevel === "daily") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const labels = data.map((item) => formatLabel(item.date));
  const gross = data.map((item) => Number(item.grossRevenue ?? 0));
  const wallet = data.map((item) => Number(item.walletEarnings ?? 0));

  const chartOptions = useChart({
    chart: {
      id: "instructor-revenue-trend",
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors: ["#1890FF", "#8E33FF"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0.28,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    stroke: { width: 2.5, curve: "smooth" },
    xaxis: {
      categories: labels,
      labels: {
        rotate: labels.length > (isMobile ? 5 : 10) ? -35 : 0,
        hideOverlappingLabels: true,
        trim: true,
        style: { fontSize: isMobile ? "9px" : "11px" },
      },
    },
    yaxis: {
      tickAmount: isMobile ? 4 : 5,
      labels: {
        style: { fontSize: isMobile ? "10px" : "11px" },
        formatter: (val) => `$${Number(val ?? 0).toFixed(0)}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `$${Number(val ?? 0).toFixed(2)}`,
      },
    },
    legend: {
      show: true,
      position: isMobile ? "bottom" : "top",
      horizontalAlign: isMobile ? "left" : "right",
      fontSize: isMobile ? "11px" : "13px",
      itemMargin: { horizontal: isMobile ? 6 : 8, vertical: 8 },
    },
    grid: {
      strokeDashArray: 3,
      padding: { left: isMobile ? -4 : 0, right: isMobile ? 4 : 0 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: { size: 0 },
  });

  if (!data?.length) {
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
          title="No revenue data available"
          description="Once students complete purchases, gross revenue and wallet earnings will appear here."
          minHeight="220px"
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
          Revenue Trend
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3 }}>
          Gross revenue and wallet earnings over time
        </Typography>
      </Box>

      <Box sx={{ height: { xs: 280, sm: 320, md: 360 }, minWidth: 0 }}>
        <Chart
          type="line"
          series={[
            { name: "Gross Revenue", data: gross },
            { name: "Wallet Earnings", data: wallet },
          ]}
          options={chartOptions}
          sx={{ height: "100%" }}
        />
      </Box>
    </Paper>
  );
}
