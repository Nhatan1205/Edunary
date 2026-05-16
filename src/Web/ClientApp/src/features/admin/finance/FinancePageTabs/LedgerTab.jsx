import { useState } from "react";
import { Box, Stack, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useGetFinanceLedger from "../../../../hooks/finance-hooks/useGetFinanceLedger";
import { FinanceDateRange, GRID_SX, financeTextFieldSx } from "./shared";

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
    valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
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

  const { data, isLoading } = useGetFinanceLedger(page + 1, rowsPerPage, {
    accountCode: accountCode || undefined,
    from: from || undefined,
    to: to || undefined,
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
          sx={{ minWidth: 200, ...financeTextFieldSx }}
        />
        <FinanceDateRange
          from={from}
          to={to}
          onFromChange={(value) => { setFrom(value); setPage(0); }}
          onToChange={(value) => { setTo(value); setPage(0); }}
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
