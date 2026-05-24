import { Box, Grid } from "@mui/material";
import RevenueTrendChart from "./revenue/RevenueTrendChart";
import RevenueBreakdownDonut from "./revenue/RevenueBreakdownDonut";
import TopCoursesRevenueChart from "./revenue/TopCoursesRevenueChart";
import useGetFinanceSummary from "../../../../hooks/finance-hooks/useGetFinanceSummary";

export default function RevenueTab() {
  const { data: summaryData, isLoading: summaryLoading } = useGetFinanceSummary(null, null);

  return (
    <Box>
      <RevenueTrendChart />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={5}>
          <RevenueBreakdownDonut summaryData={summaryData} isLoading={summaryLoading} />
        </Grid>
        <Grid item xs={12} md={7}>
          <TopCoursesRevenueChart />
        </Grid>
      </Grid>
    </Box>
  );
}
