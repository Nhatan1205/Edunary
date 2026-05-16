import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../components/AlertBox";
import useGetTaxProfile from "../../../../hooks/tax-profile-hooks/useGetTaxProfile";
import useUpdateTaxProfile from "../../../../hooks/tax-profile-hooks/useUpdateTaxProfile";

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

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function TaxProfilePage() {
  const { data, isLoading, error } = useGetTaxProfile();
  const { mutate: updateTaxProfile, isPending, error: updateError } = useUpdateTaxProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      taxCountryCode: "",
      hasSubmittedW8Ben: false,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        taxCountryCode: data.taxCountryCode || "",
        hasSubmittedW8Ben: Boolean(data.hasSubmittedW8Ben),
      });
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    updateTaxProfile({
      taxCountryCode: formData.taxCountryCode,
      hasSubmittedW8Ben: Boolean(formData.hasSubmittedW8Ben),
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
          Submit your tax residency and W-8BEN status to calculate withholding at payout.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 6 }}>
        {error && (
          <AlertBox severity="error" variant="standard" sx={{ mb: 2 }}>
            {error.message || "Failed to load tax profile."}
          </AlertBox>
        )}

        {updateError && (
          <AlertBox severity="error" variant="standard" sx={{ mb: 2 }}>
            {updateError.message || "Failed to update tax profile."}
          </AlertBox>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Tax country (ISO-2)
          </Typography>
          <TextField
            {...register("taxCountryCode", {
              validate: (value) =>
                !value || value.trim().length === 2 || "Tax country code must be exactly 2 letters",
            })}
            fullWidth
            placeholder="US"
            inputProps={{ maxLength: 2 }}
            error={!!errors.taxCountryCode}
            sx={textFieldSx}
            onChange={(event) => {
              setValue("taxCountryCode", event.target.value.toUpperCase(), { shouldValidate: true });
            }}
          />
          {errors.taxCountryCode && (
            <AlertBox severity="error" variant="standard" sx={{ mt: 1 }}>
              {errors.taxCountryCode.message}
            </AlertBox>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Switch {...register("hasSubmittedW8Ben")} checked={watch("hasSubmittedW8Ben")} />}
            label="I have submitted a W-8BEN form"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Withholding rate"
            value={formatRate(data?.withholdingRate)}
            size="small"
            InputProps={{ readOnly: true }}
            sx={textFieldSx}
          />
          <TextField
            label="W-8BEN submitted"
            value={formatDate(data?.w8BenSubmittedAt)}
            size="small"
            InputProps={{ readOnly: true }}
            sx={textFieldSx}
          />
        </Box>

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
