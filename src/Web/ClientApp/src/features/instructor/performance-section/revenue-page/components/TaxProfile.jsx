import {
  Paper, Box, Typography, Button, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, TextField
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
  const [formValues, setFormValues] = useState({
    realName: '',
    taxIdentificationNumber: '',
    taxCountryCode: '',
  });
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setFormValues({
        realName: profile?.realName ?? '',
        taxIdentificationNumber: profile?.taxIdentificationNumber ?? '',
        taxCountryCode: profile?.taxCountryCode ?? '',
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
  }, [isEditing, regions.length]);

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
      realName: formValues.realName,
      taxIdentificationNumber: formValues.taxIdentificationNumber,
      taxCountryCode: formValues.taxCountryCode,
    });
  };

  const selectedRegion = regions.find((r) => r.countryCode === formValues.taxCountryCode);
  const displayCountry = profile?.countryName
    ? `${profile.taxCountryCode} - ${profile.countryName}`
    : (profile?.taxCountryCode || '--');
  const displayWithholdingRate = isEditing && selectedRegion
    ? selectedRegion.withholdingRate
    : profile?.withholdingRate;
  const isProfileComplete = Boolean(
    profile?.realName && profile?.taxIdentificationNumber && profile?.taxCountryCode
  );
  const canSave = Boolean(
    formValues.realName.trim() &&
    formValues.taxIdentificationNumber.trim() &&
    formValues.taxCountryCode
  );

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
              disabled={updateMutation.isPending || !canSave}
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
        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Real name
          </Typography>
          {isEditing ? (
            <TextField
              size="small"
              fullWidth
              value={formValues.realName}
              onChange={(e) => setFormValues((prev) => ({ ...prev, realName: e.target.value }))}
              inputProps={{ maxLength: 200 }}
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {profile?.realName || '--'}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Tax Identification Number
          </Typography>
          {isEditing ? (
            <TextField
              size="small"
              fullWidth
              value={formValues.taxIdentificationNumber}
              onChange={(e) => setFormValues((prev) => ({ ...prev, taxIdentificationNumber: e.target.value }))}
              inputProps={{ maxLength: 64 }}
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {profile?.taxIdentificationNumber || '--'}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Country
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
                      {r.countryCode} - {r.countryName}
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

        <Box>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, mb: 0.5, fontWeight: 500 }}>
            Withholding rate
          </Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
            {formatRate(displayWithholdingRate)}
          </Typography>
        </Box>

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
              ? 'Tax profile is set. Withholding will be applied at payout.'
              : 'Tax profile is not complete. Default withholding may apply.'}
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
