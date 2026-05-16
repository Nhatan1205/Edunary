import { useState } from "react";
import {
  Alert,
  Box,
  Button,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import useGetTaxRegions from "../../../hooks/finance-hooks/useGetTaxRegions";
import useUpsertTaxRegion from "../../../hooks/finance-hooks/useUpsertTaxRegion";
import useDeleteTaxRegion from "../../../hooks/finance-hooks/useDeleteTaxRegion";

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

const financeTextFieldSx = {
  backgroundColor: "white",
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "brand.main",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "brand.main",
    },
  },
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

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useGetTaxRegions();
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Per-country VAT rates apply at checkout. Withholding rates apply to instructor payouts.
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={financeContainedButtonSx}
        >
          Add Country
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <DataGrid
        rows={data ?? []}
        columns={columns}
        getRowId={(r) => r.countryCode}
        loading={isLoading}
        disableRowSelectionOnClick
        autoHeight
        hideFooter={(data?.length ?? 0) <= 100}
        sx={GRID_SX}
      />

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
