import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../components/AlertBox";
import useGetTaxSettings from "../../../../hooks/finance-hooks/useGetTaxSettings";
import useGetTaxProfile from "../../../../hooks/tax-profile-hooks/useGetTaxProfile";
import useUpdateTaxProfile from "../../../../hooks/tax-profile-hooks/useUpdateTaxProfile";
import { PaymentClient } from "../../../../web-api-client.ts";
import { extractApiError } from "../../../../utils/helpers.js";

const textFieldSx = {
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "brand.main" },
    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
  },
};

function formatRate(rate) {
  if (rate == null) return "--";
  return `${(Number(rate) * 100).toFixed(2)}%`;
}

function TaxProfilePage() {
  const { data, isLoading, error } = useGetTaxProfile();
  const { data: taxSettings } = useGetTaxSettings();
  const { mutate: updateTaxProfile, isPending, error: updateError } = useUpdateTaxProfile();
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [regionError, setRegionError] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      realName: "",
      taxIdentificationNumber: "",
      taxCountryCode: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    setLoadingRegions(true);
    setRegionError("");
    const client = new PaymentClient();
    client.getCheckoutTaxRegions()
      .then((items) => {
        if (cancelled) return;
        setRegions(items ?? []);
      })
      .catch((error) => {
        if (cancelled) return;
        setRegions([]);
        setRegionError(
          extractApiError(error) || error?.message || "Failed to load tax regions."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingRegions(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (data) {
      reset({
        realName: data.realName || "",
        taxIdentificationNumber: data.taxIdentificationNumber || "",
        taxCountryCode: data.taxCountryCode || "",
      });
    }
  }, [data, reset]);

  const selectedCountry = watch("taxCountryCode");
  const selectedRegion = regions.find((r) => r.countryCode === selectedCountry);
  const withholdingRate = selectedRegion?.withholdingRate
    ?? data?.withholdingRate
    ?? taxSettings?.defaultWithholdingRate;

  const onSubmit = (formData) => {
    updateTaxProfile({
      realName: formData.realName,
      taxIdentificationNumber: formData.taxIdentificationNumber,
      taxCountryCode: formData.taxCountryCode,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "brand.main" }} />
      </Box>
    );
  }

  return (
    <Container className="py-2 px-0">
      <Box
        sx={{
          textAlign: "center",
          mb: 3,
          px: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Tax profile
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Add your tax identity and country so payout withholding can use the configured country rate.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 6 }}>
        {error && (
          <AlertBox severity="error" variant="standard" sx={{ mb: 2 }}>
            {extractApiError(error) || error?.message || "Failed to load tax profile."}
          </AlertBox>
        )}

        {updateError && (
          <AlertBox severity="error" variant="standard" sx={{ mb: 2 }}>
            {extractApiError(updateError) || updateError?.message || "Failed to update tax profile."}
          </AlertBox>
        )}

        {regionError && (
          <AlertBox severity="error" variant="standard" sx={{ mb: 2 }}>
            {regionError}
          </AlertBox>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          <TextField
            {...register("realName", {
              required: "Real name is required",
              maxLength: { value: 200, message: "Real name must be 200 characters or fewer" },
            })}
            label="Real name"
            fullWidth
            error={!!errors.realName}
            helperText={errors.realName?.message}
            sx={textFieldSx}
          />

          <TextField
            {...register("taxIdentificationNumber", {
              required: "Tax Identification Number is required",
              maxLength: { value: 64, message: "Tax Identification Number must be 64 characters or fewer" },
            })}
            label="Tax Identification Number"
            fullWidth
            error={!!errors.taxIdentificationNumber}
            helperText={errors.taxIdentificationNumber?.message}
            sx={textFieldSx}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Controller
            name="taxCountryCode"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.taxCountryCode}
                disabled={loadingRegions || Boolean(regionError)}
              >
                <InputLabel>Country</InputLabel>
                <Select {...field} label="Country">
                  {regions.map((region) => (
                    <MenuItem key={region.countryCode} value={region.countryCode}>
                      {region.countryCode} - {region.countryName}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.taxCountryCode?.message || "Withholding rate is based on this country."}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <TextField
          label="Withholding rate"
          value={formatRate(withholdingRate)}
          size="small"
          InputProps={{ readOnly: true }}
          sx={textFieldSx}
        />

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Save changes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default TaxProfilePage;
