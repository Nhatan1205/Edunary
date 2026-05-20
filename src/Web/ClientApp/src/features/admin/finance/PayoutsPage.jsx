import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  InputAdornment,
  Snackbar,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CustomDataGrid from "../../../components/datagrid/CustomDataGrid";
import DataGridToolbar from "../../../components/datagrid/DataGridToolbar";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetEligiblePayouts from "../../../hooks/finance-hooks/useGetEligiblePayouts";
import useGetPayoutSettings from "../../../hooks/finance-hooks/useGetPayoutSettings";
import useRunPayoutBatch from "../../../hooks/finance-hooks/useRunPayoutBatch";
import useUpdatePayoutSettings from "../../../hooks/finance-hooks/useUpdatePayoutSettings";
import { extractApiError } from "../../../utils/helpers.js";
import {
  financePaginationSx,
  financeTableCardSx,
  financeTableGridSx,
  financeTextFieldSx,
} from "./FinancePageTabs/shared";

const DEFAULT_THRESHOLD = 25;

const financeContainedButtonSx = {
  backgroundColor: "brand.main",
  color: "text.inverse",
  fontWeight: 600,
  borderRadius: "4px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "brand.dark",
    boxShadow: "none",
  },
};

const financeTextButtonSx = {
  color: "text.secondary",
  fontWeight: 600,
  borderRadius: "4px",
  "&:hover": {
    backgroundColor: "background.muted",
    color: "text.primary",
  },
};

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency === "USD" ? `$${amount}` : `${amount} ${currency}`;
};

const formatPercent = (value) => `${(Number(value ?? 0) * 100).toFixed(2)}%`;

const statusChipSx = (isReady) => ({
  height: 24,
  borderRadius: "6px",
  fontWeight: 700,
  bgcolor: isReady ? "success.lighter" : "warning.lighter",
  color: isReady ? "success.dark" : "warning.dark",
  "& .MuiChip-icon": {
    color: "inherit",
    fontSize: 16,
  },
});

const COLUMNS = [
  { field: "instructorName", headerName: "Instructor", flex: 1, minWidth: 160 },
  { field: "instructorEmail", headerName: "Email", flex: 1, minWidth: 210 },
  {
    field: "netBalance",
    headerName: "Available Balance",
    width: 150,
    valueFormatter: (v) => formatMoney(v),
  },
  {
    field: "withholdingAmount",
    headerName: "Withholding",
    width: 140,
    renderCell: (params) => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          height: "100%",
          minWidth: 0,
          py: 0.5,
        }}
      >
        <Typography variant="body2" noWrap sx={{ color: "text.primary", lineHeight: 1.25 }}>
          {formatMoney(params.row.withholdingAmount, params.row.currency)}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: "text.secondary", lineHeight: 1.25 }}>
          {formatPercent(params.row.withholdingRate)}
        </Typography>
      </Box>
    ),
  },
  {
    field: "estimatedNetAmount",
    headerName: "Estimated Net",
    width: 140,
    valueFormatter: (v) => formatMoney(v),
  },
  {
    field: "isBatchReady",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      const isReady = Boolean(params.row.isBatchReady);
      return (
        <Chip
          size="small"
          icon={isReady ? <CheckCircleOutlinedIcon /> : <ErrorOutlineOutlinedIcon />}
          label={isReady ? "Ready" : "Blocked"}
          sx={statusChipSx(isReady)}
        />
      );
    },
  },
  {
    field: "blockingReasons",
    headerName: "Reason",
    flex: 1,
    minWidth: 220,
    sortable: false,
    renderCell: (params) => {
      const reasons = params.row.blockingReasons ?? [];
      const label = reasons.length > 0 ? reasons.join(", ") : "All checks passed";

      return (
        <Tooltip title={label} placement="top" arrow>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: reasons.length > 0 ? "text.secondary" : "success.dark", maxWidth: "100%" }}
          >
            {label}
          </Typography>
        </Tooltip>
      );
    },
  },
  { field: "currency", headerName: "Currency", width: 100 },
];

function CriteriaChip({ label }) {
  return (
    <Chip
      size="small"
      icon={<CheckCircleOutlinedIcon />}
      label={label}
      sx={{
        height: 28,
        borderRadius: "6px",
        bgcolor: "background.muted",
        color: "text.secondary",
        fontWeight: 600,
        "& .MuiChip-icon": { color: "brand.main", fontSize: 16 },
      }}
    />
  );
}

export default function PayoutsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [thresholdValue, setThresholdValue] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isFetching, error, refetch } = useGetEligiblePayouts();
  const {
    data: payoutSettings,
    isLoading: settingsLoading,
    isFetching: settingsFetching,
    error: settingsError,
  } = useGetPayoutSettings();
  const { mutate: updatePayoutSettings, isPending: settingsSaving } = useUpdatePayoutSettings();
  const { mutate: runBatch, isPending: batchRunning } = useRunPayoutBatch();

  const minimumThreshold = Number(payoutSettings?.minimumThresholdUsd ?? DEFAULT_THRESHOLD);

  useEffect(() => {
    setThresholdValue(Number.isFinite(minimumThreshold) ? minimumThreshold.toString() : "");
  }, [minimumThreshold]);

  function handleRunBatch() {
    setConfirmOpen(false);
    runBatch(undefined, {
      onSuccess: (res) => {
        setSnack({ open: true, message: res?.message ?? "Batch completed", severity: "success" });
        refetch();
      },
      onError: (err) => {
        setSnack({
          open: true,
          message: extractApiError(err) || err?.message || "Failed to run payout batch.",
          severity: "error",
        });
      },
    });
  }

  function openThresholdDialog() {
    setThresholdValue(Number.isFinite(minimumThreshold) ? minimumThreshold.toString() : "");
    setThresholdOpen(true);
  }

  function closeThresholdDialog() {
    if (settingsSaving) return;
    setThresholdValue(Number.isFinite(minimumThreshold) ? minimumThreshold.toString() : "");
    setThresholdOpen(false);
  }

  function handleSaveThreshold(event) {
    event.preventDefault();

    const parsed = Number(thresholdValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setSnack({
        open: true,
        message: "Minimum payout threshold must be greater than 0.",
        severity: "error",
      });
      return;
    }

    if (parsed === minimumThreshold) {
      setSnack({ open: true, message: "No changes to save", severity: "info" });
      return;
    }

    updatePayoutSettings(
      { minimumThresholdUsd: parsed },
      {
        onSuccess: (res) => {
          setThresholdOpen(false);
          setSnack({
            open: true,
            message: res?.message ?? "Payout settings updated successfully.",
            severity: "success",
          });
        },
        onError: (err) => {
          setSnack({
            open: true,
            message: extractApiError(err) || err?.message || "Failed to update payout settings.",
            severity: "error",
          });
        },
      }
    );
  }

  const rows = useMemo(
    () => (data ?? []).map((row, index) => ({ ...row, id: row.instructorId || index })),
    [data]
  );
  const totalCount = rows.length;
  const readyCount = useMemo(() => rows.filter((row) => row.isBatchReady).length, [rows]);
  const blockedCount = totalCount - readyCount;
  const visibleRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rows, rowsPerPage]
  );

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= totalCount) {
      setPage(0);
    }
  }, [page, rowsPerPage, totalCount]);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isBusy = isLoading || settingsLoading;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payouts"
        links={[
          { name: "Admin", href: "/admin/dashboard" },
          { name: "Finance", href: "/admin/finance" },
          { name: "Payouts" },
        ]}
      />
      <PageTitle title="Payout Eligibility" />

      {(error || settingsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error || settingsError)
            || error?.message
            || settingsError?.message
            || "Failed to load payout data."}
        </Alert>
      )}

      <Card sx={{ ...financeTableCardSx, mb: 2, p: 2.25, overflow: "visible" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          gap={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AccountBalanceWalletOutlinedIcon sx={{ color: "brand.main", fontSize: 28 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                Payout criteria
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Candidates meet the balance threshold; ready instructors pass every payout check.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="flex-end"
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#F9FAFB",
                minWidth: 180,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                Minimum threshold
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {settingsLoading ? "..." : formatMoney(minimumThreshold)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={openThresholdDialog}
              disabled={settingsLoading || settingsFetching}
              sx={{
                borderColor: "brand.main",
                color: "brand.dark",
                fontWeight: 700,
                borderRadius: "4px",
                "&:hover": { borderColor: "brand.dark", backgroundColor: "brand.lighter" },
              }}
            >
              Edit Threshold
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <CriteriaChip label={`Balance at least ${formatMoney(minimumThreshold)}`} />
          <CriteriaChip label="Payout account complete" />
          <CriteriaChip label="Instructor wallet exists" />
          <CriteriaChip label="No processing withdrawal" />
          <CriteriaChip label="Estimated net payout above $0" />
        </Stack>
      </Card>

      <Card sx={financeTableCardSx}>
        <DataGridToolbar
          showSearch={false}
          filterDropdowns={(
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Payout candidates
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Candidates are filtered by the minimum balance threshold.
              </Typography>
            </Box>
          )}
          customRightAction={(
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "space-between", sm: "flex-end" },
                flexWrap: "wrap",
                gap: 1.5,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }} noWrap>
                {readyCount.toLocaleString("en-US")} ready / {totalCount.toLocaleString("en-US")} candidate
                {totalCount === 1 ? "" : "s"}
              </Typography>
              <Button
                variant="contained"
                disableElevation
                startIcon={
                  batchRunning ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PlayArrowOutlinedIcon />
                  )
                }
                disabled={batchRunning || isBusy || readyCount === 0}
                onClick={() => setConfirmOpen(true)}
                sx={{ ...financeContainedButtonSx, flexShrink: 0 }}
              >
                Run Payout Batch
              </Button>
            </Box>
          )}
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <CustomDataGrid
          rows={visibleRows}
          columns={COLUMNS}
          loading={isBusy}
          checkboxSelection={false}
          height={460}
          rowHeight={64}
          sx={financeTableGridSx}
        />

        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={financePaginationSx}
        />
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Run Payout Batch?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create withdrawal requests for {readyCount} payout-ready instructor(s).
            {blockedCount > 0 ? ` ${blockedCount} blocked candidate(s) will be skipped.` : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={financeTextButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleRunBatch}
            autoFocus
            sx={financeContainedButtonSx}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={thresholdOpen} onClose={closeThresholdDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Minimum Payout Threshold</DialogTitle>
        <DialogContent dividers>
          <Stack component="form" id="payout-threshold-form" spacing={2} onSubmit={handleSaveThreshold} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Minimum threshold"
              type="number"
              value={thresholdValue}
              onChange={(event) => setThresholdValue(event.target.value)}
              inputProps={{ min: "0.01", step: "0.01" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              disabled={settingsSaving}
              error={thresholdValue !== "" && (!Number.isFinite(Number(thresholdValue)) || Number(thresholdValue) <= 0)}
              helperText="Instructors below this available balance are excluded from payout candidates."
              sx={financeTextFieldSx}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeThresholdDialog} disabled={settingsSaving} sx={financeTextButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="payout-threshold-form"
            disableElevation
            startIcon={settingsSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            disabled={settingsSaving}
            sx={financeContainedButtonSx}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
