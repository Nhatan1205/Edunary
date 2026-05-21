import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Chip,
  TablePagination,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomDataGrid from "../../../../components/datagrid/CustomDataGrid";
import DataGridToolbar from "../../../../components/datagrid/DataGridToolbar";
import useGetFinanceLedger from "../../../../hooks/finance-hooks/useGetFinanceLedger";
import {
  FinanceDateRange,
  financePaginationSx,
  financeTableCardSx,
  financeTableGridSx,
  financeToolbarInputSx,
} from "./shared";

const ACCOUNT_GLOSSARY = [
  {
    code: "CASH_STRIPE",
    label: "Cash – Stripe",
    color: "info",
    description: "Actual cash received through the Stripe payment gateway. Debited when a student pays; credited on refund.",
  },
  {
    code: "INSTRUCTOR_GROSS_EARNINGS",
    label: "Instructor Gross Earnings",
    color: "success",
    description: "The instructor's share of revenue after the platform takes its commission. Transient account — credited when an order completes, then immediately debited to transfer the balance into INSTRUCTOR_NET_BALANCE.",
  },
  {
    code: "INSTRUCTOR_NET_BALANCE",
    label: "Instructor Net Balance",
    color: "success",
    description: "The instructor's wallet balance, before IRS withholding tax. Withholding is only deducted when an admin approves a withdrawal request (Dr NET_BALANCE → Cr IRS_WITHHOLDING + Cr CASH_STRIPE).",
  },
  {
    code: "PLATFORM_REVENUE",
    label: "Platform Revenue",
    color: "warning",
    description: "The platform's commission earnings — the percentage cut taken on each transaction after VAT and discounts.",
  },
  {
    code: "VAT_LIABILITY",
    label: "VAT Liability",
    color: "error",
    description: "VAT owed to tax authorities. Credited when VAT is collected from a student; debited when remitted.",
  },
  {
    code: "IRS_WITHHOLDING_LIABILITY",
    label: "IRS Withholding Liability",
    color: "error",
    description: "US federal income tax withheld on behalf of US-based instructors. Recognized at payout approval time.",
  },
  {
    code: "REFUND_HOLDBACK",
    label: "Refund Holdback",
    color: "default",
    description: "Amount held in reserve to cover potential refunds during the refund window. Released once the window expires.",
  },
  {
    code: "PAYOUT_PENDING",
    label: "Payout Pending",
    color: "default",
    description: "Funds awaiting transfer to the instructor. Debited when a withdrawal is initiated; credited when completed.",
  },
  {
    code: "PAYOUT_FEES",
    label: "Payout Fees",
    color: "default",
    description: "Processing fees for instructor withdrawals (transfer fees, payment gateway charges).",
  },
  {
    code: "INSTRUCTOR_FUNDED_DISCOUNT",
    label: "Instructor Funded Discount",
    color: "secondary",
    description: "Discount funded by the instructor (instructor-issued coupon). Deducted directly from the instructor's earnings.",
  },
  {
    code: "PLATFORM_FUNDED_DISCOUNT",
    label: "Platform Funded Discount",
    color: "secondary",
    description: "Discount funded by the platform (site-wide promotions). Deducted from platform revenue.",
  },
];

function AccountGlossary() {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: "12px !important",
        mb: 2,
        "&:before": { display: "none" },
        bgcolor: "#FAFAFA",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "text.secondary" }} />}
        sx={{ px: 2.5, py: 0.5, minHeight: 48 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Account Reference
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pb: 2, pt: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 1.5,
          }}
        >
          {ACCOUNT_GLOSSARY.map(({ code, label, color, description }) => (
            <Box
              key={code}
              sx={{
                p: 1.5,
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "#fff",
              }}
            >
              <Chip
                label={code}
                size="small"
                color={color}
                variant="outlined"
                sx={{ fontSize: "0.65rem", fontWeight: 700, mb: 0.75, letterSpacing: "0.04em" }}
              />
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600, mb: 0.25 }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

const LEDGER_COLUMNS = [
  {
    field: "occurredAt",
    headerName: "Date",
    width: 170,
    valueGetter: (v) => v && new Date(v),
    valueFormatter: (v) => (v ? new Date(v).toLocaleString() : "--"),
  },
  { field: "transactionType", headerName: "Type", width: 200 },
  { field: "accountCode", headerName: "Account", width: 200 },
  { field: "side", headerName: "Dr/Cr", width: 70 },
  {
    field: "amount",
    headerName: "Amount",
    width: 110,
    valueFormatter: (v) => `$${Number(v ?? 0).toFixed(2)}`,
  },
  { field: "referenceId", headerName: "Reference", width: 100 },
  { field: "description", headerName: "Description", flex: 1, minWidth: 160 },
];

export default function LedgerTab() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [accountCode, setAccountCode] = useState("");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const { data, isLoading, isFetching, refetch } = useGetFinanceLedger(page + 1, rowsPerPage, {
    accountCode: accountCode || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const rows = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <AccountGlossary />
      <Card sx={financeTableCardSx}>
        <DataGridToolbar
          showSearch={false}
          filterDropdowns={(
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <Box
                component="input"
                type="text"
                aria-label="Account Code"
                placeholder="Account Code"
                value={accountCode}
                onChange={(e) => {
                  setAccountCode(e.target.value);
                  setPage(0);
                }}
                sx={{ ...financeToolbarInputSx, flex: "1 1 190px", minWidth: 160 }}
              />
              <FinanceDateRange
                from={from}
                to={to}
                onFromChange={(value) => { setFrom(value); setPage(0); }}
                onToChange={(value) => { setTo(value); setPage(0); }}
              />
            </Box>
          )}
          customRightAction={
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }} noWrap>
              {totalCount.toLocaleString("en-US")} entr{totalCount === 1 ? "y" : "ies"}
            </Typography>
          }
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <CustomDataGrid
          rows={rows}
          columns={LEDGER_COLUMNS}
          loading={isLoading}
          checkboxSelection={false}
          height={560}
          sx={financeTableGridSx}
        />

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPageOptions={[10, 20, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={financePaginationSx}
        />
      </Card>
    </Box>
  );
}
