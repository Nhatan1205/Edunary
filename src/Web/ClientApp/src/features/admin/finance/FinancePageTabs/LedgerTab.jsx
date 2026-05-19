import { useState } from "react";
import { Box, Card, TablePagination, Typography } from "@mui/material";
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
