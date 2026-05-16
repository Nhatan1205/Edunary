import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import useGetFinanceSummary from "../../../../hooks/finance-hooks/useGetFinanceSummary";
import { FinanceDateRange, fmt } from "./shared";
import TaxSettingsSection from "./TaxSettingsSection";

const METRIC_CARDS = [
  { key: "grossSales", label: "Gross Sales", color: "#1890FF", Icon: AttachMoneyIcon },
  { key: "platformRevenue", label: "Platform Revenue", color: "#00A76F", Icon: PaidOutlinedIcon },
  { key: "instructorGrossEarnings", label: "Instructor Gross", color: "#8E33FF", Icon: SchoolOutlinedIcon },
  { key: "instructorNetEarnings", label: "Instructor Net", color: "#0C53B7", Icon: AccountBalanceWalletOutlinedIcon },
  { key: "vatCollected", label: "VAT Collected", color: "#B78103", Icon: ReceiptLongOutlinedIcon },
  { key: "withholdingTax", label: "Withholding Tax", color: "#B71D18", Icon: PercentOutlinedIcon },
  { key: "pendingPayouts", label: "Pending Payouts", color: "#637381", Icon: PaymentsOutlinedIcon },
];

function MetricCard({ label, value, color, Icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2,
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(16, 24, 40, 0.06)",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
        "&:hover": {
          borderColor: alpha(color, 0.45),
          boxShadow: "0 8px 18px rgba(16, 24, 40, 0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 21 }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 0.75,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              color: "text.primary",
              fontSize: "1.45rem",
              fontWeight: 800,
              lineHeight: 1.15,
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function SummaryTab() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const { data, isLoading, error } = useGetFinanceSummary(from || null, to || null);

  return (
    <>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              boxShadow: "0 1px 6px rgba(16, 24, 40, 0.06)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                  Financial Overview
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                  Revenue, tax, and payout totals for the selected period
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  overflowX: "auto",
                  pb: { xs: 0.5, md: 0 },
                }}
              >
                <FinanceDateRange
                  from={from}
                  to={to}
                  onFromChange={setFrom}
                  onToChange={setTo}
                />
              </Box>
            </Stack>

            <Grid container spacing={2}>
              {METRIC_CARDS.map(({ key, label, color, Icon }) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                  <MetricCard
                    label={label}
                    value={fmt(data?.[key])}
                    color={color}
                    Icon={Icon}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <TaxSettingsSection />
          </Box>
        </>
      )}
    </>
  );
}
