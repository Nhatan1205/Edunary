import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useGetTaxReport from "../../../../hooks/finance-hooks/useGetTaxReport";
import { GRID_SX, financeTextFieldSx, fmt } from "./shared";
import { extractApiError } from "../../../../utils/helpers.js";

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

export default function TaxReportTab() {
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
          sx={{ width: 160, ...financeTextFieldSx }}
        />
        {isLoading && <CircularProgress size={20} />}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error) || error?.message || "Failed to load tax report."}
        </Alert>
      )}

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
