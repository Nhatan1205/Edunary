import { Box } from "@mui/material";
import RevenueTrendChart from "./revenue/RevenueTrendChart";
import RevenueBreakdownDonut from "./revenue/RevenueBreakdownDonut";
import TopCoursesRevenueChart from "./revenue/TopCoursesRevenueChart";
import useGetFinanceSummary from "../../../../hooks/finance-hooks/useGetFinanceSummary";

export default function RevenueTab() {
  const { data: summaryData, isLoading: summaryLoading } = useGetFinanceSummary(null, null);

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      <RevenueTrendChart />

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(280px, 0.82fr) minmax(360px, 1.18fr)",
          },
          alignItems: "stretch",
          gap: 2,
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <RevenueBreakdownDonut summaryData={summaryData} isLoading={summaryLoading} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <TopCoursesRevenueChart />
        </Box>
      </Box>
    </Box>
  );
}
