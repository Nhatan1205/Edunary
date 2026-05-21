import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import CustomDataGrid from "../../../../components/datagrid/CustomDataGrid";
import DataGridToolbar from "../../../../components/datagrid/DataGridToolbar";
import useGetTaxReport from "../../../../hooks/finance-hooks/useGetTaxReport";
import {
  financePaginationSx,
  financeTableCardSx,
  financeTableGridSx,
  financeToolbarInputSx,
  fmt,
} from "./shared";
import { extractApiError } from "../../../../utils/helpers.js";

const TAX_COLUMNS = [
  { field: "countryCode", headerName: "Country", width: 120 },
  { field: "orderCount", headerName: "Orders", width: 90 },
  {
    field: "vatAmount",
    headerName: "VAT Collected",
    width: 150,
    valueFormatter: (v) => `$${Number(v ?? 0).toFixed(4)}`,
  },
];

export default function TaxReportTab() {
  const now = new Date();
  const [period, setPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isFetching, error, refetch } = useGetTaxReport(period);
  const vatByRegion = data?.vatByRegion;

  const vatRows = useMemo(
    () => (vatByRegion ?? []).map((row, index) => ({
      ...row,
      id: row.countryCode || index,
    })),
    [vatByRegion]
  );

  const totalCount = vatRows.length;
  const visibleRows = useMemo(
    () => vatRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, vatRows]
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
    <Box sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error) || error?.message || "Failed to load tax report."}
        </Alert>
      )}

      {data && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Card variant="outlined" sx={{ px: 2, py: 1, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Total VAT Collected</Typography>
            <Typography variant="h6">{fmt(data.totalVatCollected)}</Typography>
          </Card>
          <Card variant="outlined" sx={{ px: 2, py: 1, flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Total Withholding Tax</Typography>
            <Typography variant="h6">{fmt(data.totalWithholdingTax)}</Typography>
          </Card>
        </Stack>
      )}

      <Card sx={financeTableCardSx}>
        <DataGridToolbar
          showSearch={false}
          filterDropdowns={(
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.5,
                width: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary", flex: "0 0 auto" }}
              >
                VAT by Region
              </Typography>
              <Box
                component="input"
                type="text"
                aria-label="Period"
                placeholder="Period (YYYY-MM)"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setPage(0);
                }}
                sx={{ ...financeToolbarInputSx, width: 160, maxWidth: "100%" }}
              />
            </Box>
          )}
          customRightAction={
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }} noWrap>
              {totalCount.toLocaleString("en-US")} region{totalCount === 1 ? "" : "s"}
            </Typography>
          }
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <CustomDataGrid
          rows={visibleRows}
          columns={TAX_COLUMNS}
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
    </Box>
  );
}
