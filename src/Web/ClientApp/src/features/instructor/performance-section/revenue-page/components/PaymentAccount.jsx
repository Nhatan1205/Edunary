import { Paper, Box, Typography, Button, Stack, Divider, TextField, useTheme } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import useUpdatePaymentAccount from '../../../../../hooks/auth-hooks/useUpdatePaymentAccount';
import AlertBox from '../../../../../components/AlertBox';

const brandTextFieldSx = (theme) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': { borderColor: theme.palette.brand.main },
  },
  '& label.Mui-focused': { color: theme.palette.brand.main },
});

function PaymentAccount({ user, isInfoEnough }) {
  const updateMutation = useUpdatePaymentAccount();
  const theme = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    bankAccountHolder: '',
    bank: '',
    bankNumber: ''
  });

  const accountName = user?.bankAccountHolder || "";
  const bankName = user?.bank || "";
  const accountNumber = user?.bankNumber || "";

  useEffect(() => {
    if (!isEditing) {
      setFormValues({
        bankAccountHolder: accountName,
        bank: bankName,
        bankNumber: accountNumber
      });
    }
  }, [isEditing, accountName, bankName, accountNumber]);

  const displayAccountName = isEditing ? formValues.bankAccountHolder : accountName;
  const displayBankName = isEditing ? formValues.bank : bankName;
  const displayAccountNumber = isEditing ? formValues.bankNumber : accountNumber;

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
      bankAccountHolder: formValues.bankAccountHolder.trim(),
      bank: formValues.bank.trim(),
      bankNumber: formValues.bankNumber.trim(),
    });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: 3,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountBalanceIcon sx={{ color: (theme) => theme.palette.brand.main, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payout account
          </Typography>
        </Box>
        {isEditing ? (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              sx={{
                textTransform: 'none',
                color: (theme) => theme.palette.brand.main
              }}
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
                '&:hover': {
                  bgcolor: theme.palette.brand.dark,
                  boxShadow: 'none'
                }
              })}
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </Stack>
        ) : (
          <Button
            startIcon={<EditIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              color: (theme) => theme.palette.brand.main
            }}
            onClick={handleEdit}
            disabled={!user}
          >
            Edit
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Account Details */}
      <Stack spacing={2.5}>
        {/* Account Holder Name */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5,
              fontWeight: 500
            }}
          >
            Account Holder Name
          </Typography>
          {isEditing ? (
            <TextField
              value={formValues.bankAccountHolder}
              onChange={(e) => setFormValues((prev) => ({ ...prev, bankAccountHolder: e.target.value }))}
              size="small"
              fullWidth
              sx={brandTextFieldSx(theme)}
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {displayAccountName}
            </Typography>
          )}
        </Box>

        {/* Bank Name */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5,
              fontWeight: 500
            }}
          >
            Bank
          </Typography>
          {isEditing ? (
            <TextField
              value={formValues.bank}
              onChange={(e) => setFormValues((prev) => ({ ...prev, bank: e.target.value }))}
              size="small"
              fullWidth
              sx={brandTextFieldSx(theme)}
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {displayBankName}
            </Typography>
          )}
        </Box>

        {/* Account Number */}
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5,
              fontWeight: 500
            }}
          >
            Account Number
          </Typography>
          {isEditing ? (
            <TextField
              value={formValues.bankNumber}
              onChange={(e) => setFormValues((prev) => ({ ...prev, bankNumber: e.target.value }))}
              size="small"
              fullWidth
              sx={brandTextFieldSx(theme)}
            />
          ) : (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: (theme) => theme.palette.text.primary }}>
              {displayAccountNumber}
            </Typography>
          )}
        </Box>

        {/* Status */}
        <AlertBox severity={isInfoEnough ? 'success' : 'warning'} sx={{ my: 0 }}>
          {isInfoEnough ? 'Your bank information is ready.' : 'You have not updated your bank information. Update now!'}
        </AlertBox>
        {updateMutation.isError && (
          <AlertBox severity="error" sx={{ my: 0 }}>
            Failed to update payout account.
          </AlertBox>
        )}
      </Stack>
    </Paper>
  );
}

export default PaymentAccount;
