import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState } from 'react';
import useGetInstructorWallet from '../../../../../hooks/instructor-wallet-hooks/useGetInstructorWallet';
import useGetWithdrawalPreview, {
  fetchWithdrawalPreview,
} from '../../../../../hooks/instructor-wallet-hooks/useGetWithdrawalPreview';
import useWithdrawFromInstructorWallet from '../../../../../hooks/instructor-wallet-hooks/useWithdrawFromInstructorWallet';

function WithdrawalForm({ user, isInfoEnough }) {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [preview, setPreview] = useState(null);
  const [debouncedAmount, setDebouncedAmount] = useState(null);

  const { data: wallet } = useGetInstructorWallet();
  const { mutateAsync: withdrawAsync, isPending } = useWithdrawFromInstructorWallet();
  const availableBalance = wallet?.balance ?? 0;
  const minWithdrawal = 1;
  const maxWithdrawal = 50000;
  const currencySymbol = '$';
  const currencyCode = 'USD';
  const hasWithdrawalAmount = withdrawalAmount.trim() !== '';
  const parsedWithdrawalAmount = hasWithdrawalAmount
    ? parseFloat(withdrawalAmount)
    : null;
  const isPreviewAmountValid = parsedWithdrawalAmount != null
    && Number.isFinite(parsedWithdrawalAmount)
    && parsedWithdrawalAmount >= minWithdrawal
    && parsedWithdrawalAmount <= availableBalance
    && parsedWithdrawalAmount <= maxWithdrawal;
  const {
    data: withdrawalPreview,
    isFetching: isPreviewFetching,
    error: previewError,
  } = useGetWithdrawalPreview({
    amount: debouncedAmount,
    currency: currencyCode,
    enabled: isInfoEnough && isPreviewAmountValid,
  });
  const hasCurrentPreviewAmount = isPreviewAmountValid
    && debouncedAmount === parsedWithdrawalAmount;
  const livePreview = isInfoEnough && hasCurrentPreviewAmount ? withdrawalPreview : null;
  const hasPreviewError = isInfoEnough && isPreviewAmountValid && hasCurrentPreviewAmount && previewError;
  const isPreviewing = isInfoEnough
    && isPreviewAmountValid
    && (!livePreview || isPreviewFetching)
    && !hasPreviewError;

  useEffect(() => {
    if (!isPreviewAmountValid || !isInfoEnough) {
      setDebouncedAmount(null);
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedAmount(parsedWithdrawalAmount);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isInfoEnough, isPreviewAmountValid, parsedWithdrawalAmount]);

  const formatCurrencyAmount = (value) => {
    const numericValue = Number(value);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
    return `${currencySymbol}${safeValue.toLocaleString('en-US')}`;
  };

  const handleAmountChange = (event) => {
    setWithdrawalAmount(event.target.value);
    setError('');
  };
  const getPreviewText = (value, fallbackValue) => {
    if (hasPreviewError) return '--';
    if (isPreviewing) return 'Calculating...';
    return formatCurrencyAmount(value ?? fallbackValue);
  };
  const withholdingPreviewText = getPreviewText(livePreview?.withholdingAmount, 0);
  const netPreviewText = getPreviewText(
    livePreview?.netAmount,
    isPreviewAmountValid ? parsedWithdrawalAmount : 0
  );

  const validateAndGetAmount = () => {
    if (!withdrawalAmount) {
      setError('Please enter an amount');
      return null;
    }

    const amount = parseFloat(withdrawalAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0');
      return null;
    }

    if (amount < minWithdrawal) {
      setError(`Minimum amount is ${currencySymbol}${minWithdrawal.toLocaleString('en-US')} ${currencyCode}`);
      return null;
    }

    if (amount > availableBalance) {
      setError('Amount exceeds your available balance');
      return null;
    }

    if (amount > maxWithdrawal) {
      setError(`Maximum amount is ${currencySymbol}${maxWithdrawal.toLocaleString('en-US')} ${currencyCode}`);
      return null;
    }

    return amount;
  };

  const handleContinue = async () => {
    setError('');

    if (!isInfoEnough) {
      return;
    }

    const amount = validateAndGetAmount();
    if (amount == null) return;

    try {
      const canUseLivePreview = livePreview
        && !isPreviewFetching
        && !hasPreviewError
        && Number(livePreview.grossAmount) === amount;
      const result = canUseLivePreview
        ? livePreview
        : await fetchWithdrawalPreview({ amount, currency: currencyCode });
      setPreview(result);
      setPendingAmount(amount);
      setIsConfirmOpen(true);
    } catch (e) {
      setError(e?.message || 'Failed to preview withdrawal. Please try again.');
    }
  };

  const handleCancelConfirm = () => {
    if (isPending) return;
    setIsConfirmOpen(false);
    setPendingAmount(null);
    setPreview(null);
  };

  const handleConfirmWithdrawal = async () => {
    setError('');

    if (pendingAmount == null) return;

    try {
      await withdrawAsync({ amount: pendingAmount, currency: currencyCode });
      setIsConfirmOpen(false);
      setPendingAmount(null);
      setPreview(null);
      setWithdrawalAmount('');
    } catch (e) {
      setIsConfirmOpen(false);
      setPendingAmount(null);
      setPreview(null);
      setError(e?.message || 'Failed to withdraw. Please try again.');
    }
  };

  const payoutBank = user?.bank || '';
  const payoutAccountNumber = user?.bankNumber || '';
  const payoutAccountHolder = user?.bankAccountHolder || '';

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
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Withdrawal form
      </Typography>

      <Stack spacing={2.5}>
        {/* Available Balance Info */}
        <Box
          sx={(theme) => ({
            bgcolor: theme.palette.brand.lighter,
            p: 2,
            borderRadius: 1,
            borderLeft: `4px solid ${theme.palette.brand.main}`
          })}
        >
          <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.5 })}>
            Available balance
          </Typography>
          <Typography sx={(theme) => ({ fontSize: '1.25rem', fontWeight: 600, color: theme.palette.brand.main })}>
            {currencySymbol}{availableBalance.toLocaleString('en-US')} {currencyCode}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
            {error}
          </Alert>
        )}

        {/* Withdrawal Amount Input */}
        <Box>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.text.primary,
              mb: 1,
              fontWeight: 500
            })}
          >
            Amount to withdraw
          </Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="Enter amount ($)"
            value={withdrawalAmount}
            onChange={handleAmountChange}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': (theme) => ({ borderColor: theme.palette.brand.main }),
                '&.Mui-focused fieldset': (theme) => ({ borderColor: theme.palette.brand.main })
              }
            }}
            inputProps={{
              min: 0,
              step: 100
            }}
          />
          <Typography
            variant="caption"
            sx={(theme) => ({
              color: theme.palette.text.disabled,
              display: 'block',
              mt: 1
            })}
          >
            Min: {currencySymbol}{minWithdrawal.toLocaleString('en-US')} | Max: {currencySymbol}{maxWithdrawal.toLocaleString('en-US')}
          </Typography>
        </Box>

        {/* Fee Info */}
        <Box sx={(theme) => ({ backdrop: 'none', bgcolor: theme.palette.background.muted, p: 1.5, borderRadius: 1 })}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
              Withdrawal fee
            </Typography>
            <Typography variant="body2" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
              Free
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
              Withholding tax
            </Typography>
            <Typography variant="body2" sx={(theme) => ({ fontWeight: 600, color: theme.palette.text.primary })}>
              {withholdingPreviewText}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
              You'll receive
            </Typography>
            <Typography sx={(theme) => ({ fontWeight: 600, color: theme.palette.brand.main })}>
              {netPreviewText}
            </Typography>
          </Box>
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleContinue}
          disabled={isPending || !isInfoEnough}
          sx={(theme) => ({
            bgcolor: theme.palette.brand.main,
            color: theme.palette.text.inverse,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.25,
            fontSize: '1rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: theme.palette.brand.dark,
              boxShadow: 'none'
            }
          })}
        >
          Continue
        </Button>
      </Stack>

      <Dialog
        open={isConfirmOpen}
        onClose={handleCancelConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2.5
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm withdrawal
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Amount
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {currencySymbol}{(pendingAmount ?? 0).toLocaleString('en-US')} {currencyCode}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Withholding tax
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {currencySymbol}{Number(preview?.withholdingAmount ?? 0).toLocaleString('en-US')} {currencyCode}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Net payout
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {currencySymbol}{Number(preview?.netAmount ?? 0).toLocaleString('en-US')} {currencyCode}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Bank
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {payoutBank || '--'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Account number
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {payoutAccountNumber || '--'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, mb: 0.25 })}>
                Beneficiary
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {payoutAccountHolder || '--'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCancelConfirm}
            disabled={isPending}
            sx={(theme) => ({
              textTransform: 'none',
              fontWeight: 600,
              color: theme.palette.brand.main,
              '&:hover': {
                bgcolor: theme.palette.brand.lighter
              }
            })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmWithdrawal}
            disabled={isPending}
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
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default WithdrawalForm;
