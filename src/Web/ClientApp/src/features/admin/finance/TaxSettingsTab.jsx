import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import useGetTaxSettings from "../../../hooks/finance-hooks/useGetTaxSettings";
import useUpdateTaxSettings from "../../../hooks/finance-hooks/useUpdateTaxSettings";

export default function TaxSettingsTab() {
  const { data: settings, isLoading, error, isRefetching } = useGetTaxSettings();
  const { mutate: updateSettings, isPending, error: updateError, isSuccess } = useUpdateTaxSettings();

  const [formData, setFormData] = useState({
    defaultVatRate: "",
    defaultWithholdingRate: "",
  });

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Populate form when data is loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        defaultVatRate: settings.defaultVatRate?.toString() || "",
        defaultWithholdingRate: settings.defaultWithholdingRate?.toString() || "",
      });
    }
  }, [settings]);

  // Show success message
  useEffect(() => {
    if (isSuccess) {
      setSnack({ open: true, message: "Tax settings updated successfully", severity: "success" });
    }
  }, [isSuccess]);

  // Show error message
  useEffect(() => {
    if (updateError) {
      setSnack({ open: true, message: updateError.message || "Failed to update settings", severity: "error" });
    }
  }, [updateError]);

  // Show initial error
  useEffect(() => {
    if (error) {
      setSnack({ open: true, message: error.message || "Failed to load settings", severity: "error" });
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
      setSnack({ open: true, message: "No changes to save", severity: "info" });
      return;
    }

    updateSettings(payload);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        defaultVatRate: settings.defaultVatRate?.toString() || "",
        defaultWithholdingRate: settings.defaultWithholdingRate?.toString() || "",
      });
      setSnack({ open: true, message: "Form reset to current values", severity: "info" });
    }
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
      {/* Header Section */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SettingsIcon sx={{ color: "primary.main", fontSize: 28 }} />
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

      {/* Current Values Preview Cards */}
      {settings && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 2,
                backgroundColor: alpha("#2196f3", 0.08),
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  VAT Rate
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
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
                backgroundColor: alpha("#ff9800", 0.08),
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Withholding Rate
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
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
      )}

      {/* Form Card */}
      <Card
        elevation={1}
        sx={{
          borderRadius: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Update Tax Rates
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button
                variant="contained"
                type="submit"
                startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                disabled={isPending || isRefetching}
                sx={{ minWidth: 140 }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={isPending || isRefetching}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
