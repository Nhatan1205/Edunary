import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PageTitle from "../../../components/PageTitle";
import useGetAdminWithdrawalRequests from "../../../hooks/instructor-wallet-hooks/useGetAdminWithdrawalRequests";
import useHandleAdminWithdrawalRequest from "../../../hooks/instructor-wallet-hooks/useHandleAdminWithdrawalRequest";

const STATUS_VALUES = {
  Succeeded: 0,
  Processing: 1,
  Cancelled: 2,
};

function formatStatus(status) {
  switch (status) {
    case STATUS_VALUES.Succeeded:
      return { label: "Succeeded", color: "success" };
    case STATUS_VALUES.Processing:
      return { label: "Processing", color: "warning" };
    case STATUS_VALUES.Cancelled:
      return { label: "Cancelled", color: "default" };
    default:
      return { label: "Unknown", color: "default" };
  }
}

function formatDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WithdrawalRequestsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeRequestId, setActiveRequestId] = useState(null);

  const statusFilter = status === "" ? null : Number(status);

  const queryOptions = useMemo(
    () => ({
      status: statusFilter,
      fromDate: fromDate || null,
      toDate: toDate || null,
    }),
    [statusFilter, fromDate, toDate]
  );

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetAdminWithdrawalRequests(page, 10, queryOptions);

  const {
    mutateAsync: mutateStatusAsync,
    isPending: isMutating,
    isError: isMutateError,
    error: mutateError,
    reset: resetMutation,
  } = useHandleAdminWithdrawalRequest();

  const rows = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleFilterChanged = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleAction = async (requestId, action) => {
    resetMutation();
    setActiveRequestId(requestId);

    try {
      await mutateStatusAsync({ requestId, action });
    } finally {
      setActiveRequestId(null);
    }
  };

  return (
    <Box>
      <PageTitle title="Withdrawal Requests" subtitle="Review and process instructor withdrawal requests" />

      <Paper variant="outlined" sx={{ p: 2.5, borderColor: "divider", mt: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="withdrawal-status-label">Status</InputLabel>
            <Select
              labelId="withdrawal-status-label"
              label="Status"
              value={status}
              onChange={handleFilterChanged(setStatus)}
            >
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value={String(STATUS_VALUES.Processing)}>Processing</MenuItem>
              <MenuItem value={String(STATUS_VALUES.Succeeded)}>Succeeded</MenuItem>
              <MenuItem value={String(STATUS_VALUES.Cancelled)}>Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="From"
            value={fromDate}
            onChange={handleFilterChanged(setFromDate)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            value={toDate}
            onChange={handleFilterChanged(setToDate)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error?.message || "Failed to load withdrawal requests."}
          </Alert>
        ) : null}

        {isMutateError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutateError?.message || "Failed to process withdrawal request."}
          </Alert>
        ) : null}

        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.muted" }}>
                <TableCell>Requested At</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Beneficiary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography align="center" sx={{ py: 2, color: "text.secondary" }}>
                      No withdrawal requests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const statusInfo = formatStatus(row.status);
                  const isProcessing = row.status === STATUS_VALUES.Processing;
                  const isRowPending = isMutating && activeRequestId === row.id;

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{formatDateTime(row.created)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.instructorName || "--"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {row.instructorId || "--"}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {(row.amount ?? 0).toLocaleString("en-US")} {row.currency || "USD"}
                      </TableCell>
                      <TableCell>{row.bank || "--"}</TableCell>
                      <TableCell>{row.bankNumber || "--"}</TableCell>
                      <TableCell>{row.bankAccountHolder || "--"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={statusInfo.color}
                          label={statusInfo.label}
                          variant={statusInfo.color === "default" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={!isProcessing || isRowPending}
                            onClick={() => handleAction(row.id, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={!isProcessing || isRowPending}
                            onClick={() => handleAction(row.id, "cancel")}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 ? (
          <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
            />
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
}

export default WithdrawalRequestsPage;
