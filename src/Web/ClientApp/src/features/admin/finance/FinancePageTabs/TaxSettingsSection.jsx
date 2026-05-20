import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import useGetTaxSettings from "../../../../hooks/finance-hooks/useGetTaxSettings";
import useUpdateTaxSettings from "../../../../hooks/finance-hooks/useUpdateTaxSettings";
import { financeTextFieldSx } from "./shared";
import { extractApiError } from "../../../../utils/helpers.js";

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

const financeOutlinedButtonSx = {
  borderColor: "brand.main",
  color: "brand.dark",
  fontWeight: 600,
  borderRadius: "4px",
  "&:hover": {
    borderColor: "brand.dark",
    backgroundColor: "brand.lighter",
  },
};

const getSettingsFormData = (settings) => ({
  defaultVatRate: settings?.defaultVatRate?.toString() || "",
  defaultWithholdingRate: settings?.defaultWithholdingRate?.toString() || "",
});

export default function TaxSettingsSection() {
  const { data: settings, isLoading, error, isRefetching } = useGetTaxSettings();
  const { mutate: updateSettings, isPending, error: updateError, isSuccess } = useUpdateTaxSettings();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(getSettingsFormData());

  useEffect(() => {
    if (settings) {
      setFormData(getSettingsFormData(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Tax settings updated successfully");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (updateError) {
      toast.error(extractApiError(updateError) || updateError?.message || "Failed to update settings");
    }
  }, [updateError]);

  useEffect(() => {
    if (error) {
      toast.error(extractApiError(error) || error?.message || "Failed to load settings");
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {};

    if (formData.defaultVatRate !== "" && formData.defaultVatRate !== settings?.defaultVatRate?.toString()) {
      payload.defaultVatRate = parseFloat(formData.defaultVatRate);
    }

    if (formData.defaultWithholdingRate !== "" && formData.defaultWithholdingRate !== settings?.defaultWithholdingRate?.toString()) {
      payload.defaultWithholdingRate = parseFloat(formData.defaultWithholdingRate);
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateSettings(payload, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleReset = () => {
    if (settings) {
      setFormData(getSettingsFormData(settings));
      toast.info("Form reset to current values");
    }
  };

  const openEditDialog = () => {
    setFormData(getSettingsFormData(settings));
    setDialogOpen(true);
  };

  const closeEditDialog = () => {
    if (isPending) return;
    setFormData(getSettingsFormData(settings));
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SettingsIcon sx={{ color: "brand.main", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Tax Rate Configuration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage default tax rates for VAT and instructor withholding
            </Typography>
          </Box>
        </Box>
      </Stack>

      {settings && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "2px solid",
                  borderColor: "info.main",
                  borderRadius: 2,
                  backgroundColor: alpha("#1890FF", 0.08),
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    VAT Rate
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "info.main" }}>
                      {(settings.defaultVatRate * 100).toFixed(2)}%
                    </Typography>
                    <Chip
                      label="Default"
                      size="small"
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Applied to all orders where no regional VAT is configured
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "2px solid",
                  borderColor: "warning.main",
                  borderRadius: 2,
                  backgroundColor: alpha("#FFC107", 0.12),
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    Withholding Rate
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.dark" }}>
                      {(settings.defaultWithholdingRate * 100).toFixed(2)}%
                    </Typography>
                    <Chip
                      label="Default"
                      size="small"
                      variant="outlined"
                      sx={{ height: 20 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Tax withheld from instructor payouts
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Stack
            direction="row"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={openEditDialog}
              disabled={isRefetching}
              disableElevation
              sx={{
                width: { xs: "100%", sm: "auto" },
                ...financeContainedButtonSx,
              }}
            >
              Edit Default Tax
            </Button>
          </Stack>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Default Tax</DialogTitle>
        <DialogContent dividers>
          <Stack id="default-tax-form" component="form" onSubmit={handleSubmit} spacing={3} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default VAT Rate"
                  name="defaultVatRate"
                  type="number"
                  inputProps={{ step: "0.01", min: "0", max: "1" }}
                  value={formData.defaultVatRate}
                  onChange={handleInputChange}
                  placeholder="0.19"
                  helperText="Enter as decimal (e.g., 0.19 for 19%)"
                  disabled={isRefetching || isPending}
                  variant="outlined"
                  size="medium"
                  error={isNaN(parseFloat(formData.defaultVatRate)) && formData.defaultVatRate !== ""}
                  sx={financeTextFieldSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Withholding Rate"
                  name="defaultWithholdingRate"
                  type="number"
                  inputProps={{ step: "0.01", min: "0", max: "1" }}
                  value={formData.defaultWithholdingRate}
                  onChange={handleInputChange}
                  placeholder="0.30"
                  helperText="Enter as decimal (e.g., 0.30 for 30%)"
                  disabled={isRefetching || isPending}
                  variant="outlined"
                  size="medium"
                  error={isNaN(parseFloat(formData.defaultWithholdingRate)) && formData.defaultWithholdingRate !== ""}
                  sx={financeTextFieldSx}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={closeEditDialog} disabled={isPending} sx={{ color: "text.secondary", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={isPending || isRefetching}
            sx={financeOutlinedButtonSx}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="default-tax-form"
            startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            disabled={isPending || isRefetching}
            disableElevation
            sx={{ minWidth: 140, ...financeContainedButtonSx }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
