import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetEligiblePayouts from "../../../hooks/finance-hooks/useGetEligiblePayouts";
import useRunPayoutBatch from "../../../hooks/finance-hooks/useRunPayoutBatch";
import { extractApiError } from "../../../utils/helpers.js";

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
    valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
  },
  { field: "currency", headerName: "Currency", width: 100 },
];

export default function PayoutsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const { data, isLoading, error, refetch } = useGetEligiblePayouts();
  const { mutate: runBatch, isLoading: batchRunning } = useRunPayoutBatch();

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

  const rows = (data ?? []).map((r) => ({ ...r, id: r.instructorId }));

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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Instructors whose available balance meets the minimum payout threshold.
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
          sx={financeContainedButtonSx}
        >
          Run Payout Batch
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error) || error?.message || "Failed to load eligible payouts."}
        </Alert>
      )}

      <DataGrid
        rows={rows}
        columns={COLUMNS}
        loading={isLoading}
        disableRowSelectionOnClick
        autoHeight
        sx={GRID_SX}
      />

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
