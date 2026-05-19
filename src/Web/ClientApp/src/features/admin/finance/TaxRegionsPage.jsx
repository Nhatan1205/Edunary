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
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CustomDataGrid from "../../../components/datagrid/CustomDataGrid";
import DataGridToolbar from "../../../components/datagrid/DataGridToolbar";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetTaxRegions from "../../../hooks/finance-hooks/useGetTaxRegions";
import useUpsertTaxRegion from "../../../hooks/finance-hooks/useUpsertTaxRegion";
import useDeleteTaxRegion from "../../../hooks/finance-hooks/useDeleteTaxRegion";
import { extractApiError } from "../../../utils/helpers.js";
import {
  financePaginationSx,
  financeTableCardSx,
  financeTableGridSx,
  financeTextFieldSx,
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

const destructiveContainedButtonSx = {
  fontWeight: 600,
  borderRadius: "4px",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
};

const EMPTY_FORM = {
  countryCode: "",
  countryName: "",
  vatRate: "",
  withholdingRate: "",
  isActive: true,
};

export default function TaxRegionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetTaxRegions();
  const { mutate: upsert, isLoading: upserting } = useUpsertTaxRegion();
  const { mutate: remove, isLoading: deleting } = useDeleteTaxRegion();

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEdit(row) {
    setForm({
      countryCode: row.countryCode,
      countryName: row.countryName ?? "",
      vatRate: String(Math.round(row.vatRate * 10000) / 100),
      withholdingRate: String(Math.round((row.withholdingRate ?? 0) * 10000) / 100),
      isActive: row.isActive,
    });
    setFormError("");
    setDialogMode("edit");
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.countryCode || !/^[A-Za-z]{2}$/.test(form.countryCode)) {
      setFormError("Country code must be exactly 2 letters.");
      return;
    }
    if (!form.countryName.trim()) {
      setFormError("Country name is required.");
      return;
    }
    const vatPercent = parseFloat(form.vatRate);
    if (isNaN(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      setFormError("VAT rate must be between 0 and 100.");
      return;
    }
    const withholdingPercent = parseFloat(form.withholdingRate);
    if (isNaN(withholdingPercent) || withholdingPercent < 0 || withholdingPercent > 100) {
      setFormError("Withholding rate must be between 0 and 100.");
      return;
    }

    upsert(
      {
        countryCode: form.countryCode.toUpperCase(),
        countryName: form.countryName.trim(),
        vatRate: vatPercent / 100,
        withholdingRate: withholdingPercent / 100,
        isActive: form.isActive,
      },
      { onSuccess: () => setDialogOpen(false) }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const rows = useMemo(
    () => (data ?? []).map((row) => ({ ...row, id: row.countryCode })),
    [data]
  );
  const filteredRows = useMemo(() => {
    if (!normalizedSearchTerm) {
      return rows;
    }

    return rows.filter((row) => {
      const countryCode = String(row.countryCode ?? "").toLowerCase();
      const countryName = String(row.countryName ?? "").toLowerCase();

      return countryCode.includes(normalizedSearchTerm) || countryName.includes(normalizedSearchTerm);
    });
  }, [normalizedSearchTerm, rows]);
  const totalCount = filteredRows.length;
  const visibleRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= totalCount) {
      setPage(0);
    }
  }, [page, rowsPerPage, totalCount]);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setPage(0);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const columns = [
    { field: "countryCode", headerName: "Country Code", width: 130 },
    { field: "countryName", headerName: "Country Name", width: 200 },
    {
      field: "vatRate",
      headerName: "VAT Rate",
      width: 120,
      valueFormatter: (v) => `${(Number(v) * 100).toFixed(2)}%`,
    },
    {
      field: "withholdingRate",
      headerName: "Withholding Rate",
      width: 170,
      valueFormatter: (v) => `${(Number(v) * 100).toFixed(2)}%`,
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 90,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          size="small"
          color={value ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(row.countryCode)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Tax Regions"
        links={[
          { name: "Admin", href: "/admin/dashboard" },
          { name: "Finance", href: "/admin/finance" },
          { name: "Tax Regions" },
        ]}
      />
      <PageTitle title="Country Tax Rates" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractApiError(error) || error?.message || "Failed to load tax regions."}
        </Alert>
      )}

      <Card sx={financeTableCardSx}>
        <DataGridToolbar
          filterName={searchTerm}
          onFilterName={handleSearchChange}
          searchPlaceholder="Search country name or code..."
          filterDropdowns={(
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Country tax rates list
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Per-country VAT rates apply at checkout. Withholding rates apply to instructor payouts.
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
                {totalCount.toLocaleString("en-US")} countr{totalCount === 1 ? "y" : "ies"}
              </Typography>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ ...financeContainedButtonSx, flexShrink: 0 }}
              >
                Add Country
              </Button>
            </Box>
          )}
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <CustomDataGrid
          rows={visibleRows}
          columns={columns}
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

      {/* Upsert dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogMode === "create" ? "Add Country" : `Edit ${form.countryCode}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Country Code"
              value={form.countryCode}
              onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 2) }))}
              disabled={dialogMode === "edit"}
              inputProps={{ maxLength: 2 }}
              placeholder="e.g. VN"
              size="small"
              fullWidth
              sx={financeTextFieldSx}
            />
            <TextField
              label="Country Name"
              value={form.countryName}
              onChange={(e) => setForm((f) => ({ ...f, countryName: e.target.value }))}
              inputProps={{ maxLength: 100 }}
              placeholder="e.g. 🇻🇳 Vietnam"
              size="small"
              fullWidth
              sx={financeTextFieldSx}
            />
            <TextField
              label="VAT Rate %"
              type="number"
              value={form.vatRate}
              onChange={(e) => setForm((f) => ({ ...f, vatRate: e.target.value }))}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              placeholder="e.g. 10"
              helperText="Enter as a percentage, e.g. 10 for 10%"
              size="small"
              fullWidth
              sx={financeTextFieldSx}
            />
            <TextField
              label="Withholding Rate %"
              type="number"
              value={form.withholdingRate}
              onChange={(e) => setForm((f) => ({ ...f, withholdingRate: e.target.value }))}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              placeholder="e.g. 30"
              helperText="Enter as a percentage, e.g. 30 for 30%"
              size="small"
              fullWidth
              sx={financeTextFieldSx}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={financeTextButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSave}
            disabled={upserting}
            startIcon={upserting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={financeContainedButtonSx}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Tax Region?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove <strong>{deleteTarget}</strong> from the VAT table? Future orders from this country
            and instructor payouts for this country will fall back to default tax rates.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={financeTextButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={destructiveContainedButtonSx}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
