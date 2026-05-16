import {
  Paper, Box, Typography, Button, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, CircularProgress
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import { PaymentClient } from '../../../../../web-api-client.ts';
import useGetTaxProfile from '../../../../../hooks/tax-profile-hooks/useGetTaxProfile';
import useUpdateTaxProfile from '../../../../../hooks/tax-profile-hooks/useUpdateTaxProfile';

function formatRate(rate) {
  if (rate == null) return '--';
  return `${(Number(rate) * 100).toFixed(0)}%`;
}

function TaxProfile() {
  const { data: profile, isLoading } = useGetTaxProfile();
  const updateMutation = useUpdateTaxProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ taxCountryCode: '', hasSubmittedW8Ben: false });
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setFormValues({
        taxCountryCode: profile?.taxCountryCode ?? '',
        hasSubmittedW8Ben: Boolean(profile?.hasSubmittedW8Ben),
      });
    }
  }, [isEditing, profile]);

  useEffect(() => {
    if (isEditing && regions.length === 0) {
      setLoadingRegions(true);
      const client = new PaymentClient();
      client.getCheckoutTaxRegions()
        .then((data) => setRegions(data ?? []))
        .catch(() => setRegions([]))
        .finally(() => setLoadingRegions(false));
    }
  }, [isEditing]);

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setIsEditing(false);
    }
  }, [updateMutation.isSuccess]);

  const handleEdit = () => {
    updateMutation.reset();
    setIsEditing(true);
  };

  const handleCancel = () => {
    updateMutation.reset();
    setIsEditing(false);
  };

  const handleSave = () => {
    updateMutation.mutate({
      taxCountryCode: formValues.taxCountryCode,
      hasSubmittedW8Ben: formValues.hasSubmittedW8Ben,
    });
  };

  const countryName = regions.find((r) => r.countryCode === profile?.taxCountryCode)?.countryName;
  const displayCountry = countryName
    ? `${profile.taxCountryCode} — ${countryName}`
    : (profile?.taxCountryCode || '--');

  const isProfileComplete = Boolean(profile?.taxCountryCode);

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 3, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} sx={{ color: (theme) => theme.palette.brand.main }} />
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: 3, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <GavelIcon sx={{ color: (theme) => theme.palette.brand.main, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tax profile
          </Typography>
        </Box>
        {isEditing ? (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              sx={{ textTransform: 'none', color: (theme) => theme.palette.brand.main }}
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              sx={(theme) => ({
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: theme.palette.brand.main,
                color: theme.palette.text.inverse,
                boxShadow: 'none',
                '&:hover': { bgcolor: theme.palette.brand.dark, boxShadow: 'none' },
              })}
              onClick={handleSave}
              disabled={updateMutation.isPending || !formValues.taxCountryCode}
            >
              Save
            </Button>
          </Stack>
        ) : (
          <Button
            startIcon={<EditIcon />}
            size="small"
            sx={{ textTransform: 'none', color: (theme) => theme.palette.brand.main }}
            onClick={handleEdit}
          >
            Edit
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2.5}>
        {/* Country */}
        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Tax country
          </Typography>
          {isEditing ? (
            loadingRegions ? (
              <CircularProgress size={20} sx={{ color: (theme) => theme.palette.brand.main }} />
            ) : (
              <FormControl size="small" fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formValues.taxCountryCode}
                  label="Country"
                  onChange={(e) => setFormValues((prev) => ({ ...prev, taxCountryCode: e.target.value }))}
                >
                  {regions.map((r) => (
                    <MenuItem key={r.countryCode} value={r.countryCode}>
                      {r.countryCode} — {r.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {displayCountry}
            </Typography>
          )}
        </Box>

        {/* W-8BEN */}
        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            W-8BEN status
          </Typography>
          {isEditing ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.hasSubmittedW8Ben}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, hasSubmittedW8Ben: e.target.checked }))}
                  sx={{ color: (theme) => theme.palette.brand.main, '&.Mui-checked': { color: (theme) => theme.palette.brand.main } }}
                />
              }
              label="I have submitted a W-8BEN form"
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {profile?.hasSubmittedW8Ben ? 'Submitted' : 'Not submitted'}
            </Typography>
          )}
        </Box>

        {/* Withholding rate (read-only) */}
        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Withholding rate
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
            {formatRate(profile?.withholdingRate)}
          </Typography>
        </Box>

        {/* Status footer */}
        <Box
          sx={(theme) => ({
            bgcolor: theme.palette.background.muted,
            p: 1.5,
            borderRadius: 1,
            borderLeft: `4px solid ${isProfileComplete ? theme.palette.success.main : theme.palette.warning.main}`,
          })}
        >
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: isProfileComplete ? theme.palette.success.main : theme.palette.warning.main,
              fontWeight: 600,
            })}
          >
            {isProfileComplete
              ? '✓ Tax profile is set. Withholding will be applied at payout.'
              : '⚠ Tax profile not set. Default 30% withholding rate will apply.'}
          </Typography>
          {updateMutation.isError && (
            <Typography variant="body2" sx={{ mt: 0.75, color: (theme) => theme.palette.error.main }}>
              Failed to update tax profile.
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default TaxProfile;
