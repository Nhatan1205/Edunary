import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetFinanceSummary from "../../../hooks/finance-hooks/useGetFinanceSummary";
import useGetFinanceLedger from "../../../hooks/finance-hooks/useGetFinanceLedger";
import useGetTaxReport from "../../../hooks/finance-hooks/useGetTaxReport";
import TaxSettingsTab from "./TaxSettingsTab";

const TABS = ["Summary", "Ledger", "Tax Report", "Tax Settings"];

const METRIC_CARDS = [
  { key: "grossSales", label: "Gross Sales", color: "#2196f3" },
  { key: "platformRevenue", label: "Platform Revenue", color: "#4caf50" },
  { key: "instructorGrossEarnings", label: "Instructor Gross", color: "#9c27b0" },
  { key: "instructorNetEarnings", label: "Instructor Net", color: "#00bcd4" },
  { key: "vatCollected", label: "VAT Collected", color: "#ff9800" },
  { key: "withholdingTax", label: "Withholding Tax", color: "#f44336" },
  { key: "pendingPayouts", label: "Pending Payouts", color: "#607d8b" },
];

const GRID_SX = {
  border: "1px solid #e0e0e0",
  borderRadius: 1,
  "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    color: "#555",
  },
  "& .MuiDataGrid-cell:focus": { outline: "none" },
  "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
};

function fmt(v) {
  return `$${Number(v ?? 0).toFixed(2)}`;
}

function SummaryTab({ from, to }) {
  const { data, isLoading, error } = useGetFinanceSummary(from, to);

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {METRIC_CARDS.map(({ key, label, color }) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {label}
              </Typography>
              <Typography variant="h5" sx={{ color }}>
                {fmt(data?.[key])}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const LEDGER_COLUMNS = [
  {
    field: "occurredAt",
    headerName: "Date",
    width: 170,
    valueGetter: (v) => v && new Date(v),
    valueFormatter: (v) => (v ? new Date(v).toLocaleString() : "—"),
  },
  { field: "transactionType", headerName: "Type", width: 200 },
  { field: "accountCode", headerName: "Account", width: 200 },
  { field: "side", headerName: "Dr/Cr", width: 70 },
  {
    field: "amount",
    headerName: "Amount",
    width: 110,
    valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
  },
  { field: "referenceId", headerName: "Reference", width: 100 },
  { field: "description", headerName: "Description", flex: 1, minWidth: 160 },
];

function LedgerTab() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [accountCode, setAccountCode] = useState("");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const { data, isLoading } = useGetFinanceLedger(page + 1, rowsPerPage, {
    accountCode: accountCode || undefined,
    from: from ? from.toISOString() : undefined,
    to: to ? to.toISOString() : undefined,
  });

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Account Code"
          placeholder="e.g. CASH_STRIPE"
          value={accountCode}
          onChange={(e) => {
            setAccountCode(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        />
        <DatePicker
          label="From"
          value={from}
          onChange={(v) => { setFrom(v); setPage(0); }}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          label="To"
          value={to}
          onChange={(v) => { setTo(v); setPage(0); }}
          slotProps={{ textField: { size: "small" } }}
        />
      </Stack>

      <DataGrid
        rows={data?.items ?? []}
        columns={LEDGER_COLUMNS}
        loading={isLoading}
        getRowId={(r) => r.id}
        disableRowSelectionOnClick
        rowCount={data?.totalCount ?? 0}
        paginationMode="server"
        paginationModel={{ page, pageSize: rowsPerPage }}
        onPaginationModelChange={(m) => { setPage(m.page); setRowsPerPage(m.pageSize); }}
        pageSizeOptions={[10, 20, 50]}
        autoHeight
        sx={GRID_SX}
      />
    </Box>
  );
}

const TAX_COLUMNS = [
  { field: "countryCode", headerName: "Country", width: 120 },
  { field: "orderCount", headerName: "Orders", width: 90 },
  {
    field: "vatAmount",
    headerName: "VAT Collected",
    width: 150,
    valueFormatter: (v) => `$${Number(v).toFixed(4)}`,
  },
];

function TaxReportTab() {
  const now = new Date();
  const [period, setPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const { data, isLoading, error } = useGetTaxReport(period);

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <TextField
          size="small"
          label="Period (YYYY-MM)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          sx={{ width: 160 }}
        />
        {isLoading && <CircularProgress size={20} />}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      {data && (
        <>
          <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
            <Card variant="outlined" sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">Total VAT Collected</Typography>
              <Typography variant="h6">{fmt(data.totalVatCollected)}</Typography>
            </Card>
            <Card variant="outlined" sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">Total Withholding Tax</Typography>
              <Typography variant="h6">{fmt(data.totalWithholdingTax)}</Typography>
            </Card>
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>VAT by Region</Typography>
          {data.vatByRegion?.length === 0
            ? <Typography color="text.secondary">No VAT data for this period.</Typography>
            : (
              <DataGrid
                rows={data.vatByRegion?.map((r) => ({ ...r, id: r.countryCode })) ?? []}
                columns={TAX_COLUMNS}
                disableRowSelectionOnClick
                hideFooter
                autoHeight
                sx={GRID_SX}
              />
            )
          }
        </>
      )}
    </Box>
  );
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Finance"
        links={[
          { name: "Admin", href: "/admin/dashboard" },
          { name: "Finance" },
        ]}
      />
      <PageTitle title="Finance Dashboard" />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <DatePicker
          label="From"
          value={from}
          onChange={setFrom}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          label="To"
          value={to}
          onChange={setTo}
          slotProps={{ textField: { size: "small" } }}
        />
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        {TABS.map((label) => <Tab key={label} label={label} />)}
      </Tabs>

      {activeTab === 0 && (
        <SummaryTab
          from={from ? from.toISOString() : null}
          to={to ? to.toISOString() : null}
        />
      )}
      {activeTab === 1 && <LedgerTab />}
      {activeTab === 2 && <TaxReportTab />}
      {activeTab === 3 && <TaxSettingsTab />}
    </Box>
  );
}
