import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TablePagination,
  Typography,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CustomDataGrid from "../../../components/datagrid/CustomDataGrid";
import DataGridToolbar from "../../../components/datagrid/DataGridToolbar";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetEligiblePayouts from "../../../hooks/finance-hooks/useGetEligiblePayouts";
import useRunPayoutBatch from "../../../hooks/finance-hooks/useRunPayoutBatch";
import { extractApiError } from "../../../utils/helpers.js";
import {
  financePaginationSx,
  financeTableCardSx,
  financeTableGridSx,
} from "./FinancePageTabs/shared";

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

const COLUMNS = [
  { field: "instructorName", headerName: "Instructor", flex: 1, minWidth: 160 },
  { field: "instructorEmail", headerName: "Email", flex: 1, minWidth: 200 },
  {
    field: "netBalance",
    headerName: "Available Balance",
    width: 140,
    valueFormatter: (v) => `$${Number(v ?? 0).toFixed(2)}`,
  },
  { field: "currency", headerName: "Currency", width: 100 },
];

export default function PayoutsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isFetching, error, refetch } = useGetEligiblePayouts();
  const { mutate: runBatch, isPending: batchRunning } = useRunPayoutBatch();

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

  const rows = useMemo(
    () => (data ?? []).map((row, index) => ({ ...row, id: row.instructorId || index })),
    [data]
  );
  const totalCount = rows.length;
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
      <PageTitle title="Eligible Payouts" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error) || error?.message || "Failed to load eligible payouts."}
        </Alert>
      )}

      <Card sx={financeTableCardSx}>
        <DataGridToolbar
          showSearch={false}
          filterDropdowns={(
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Eligible payouts list
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Instructors whose available balance meets the minimum payout threshold.
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
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }} noWrap>
                {totalCount.toLocaleString("en-US")} instructor{totalCount === 1 ? "" : "s"}
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
                disabled={batchRunning || isLoading}
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
          loading={isLoading}
          checkboxSelection={false}
          height={420}
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
            This will create withdrawal requests for all {data?.length ?? 0} eligible instructor(s).
            Only instructors with a configured payout account will be included.
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
