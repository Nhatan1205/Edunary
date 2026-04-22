import { Paper, Box, Typography, Alert } from '@mui/material';
import WalletIcon from '@mui/icons-material/Wallet';
import useGetInstructorWallet from '../../../../../hooks/instructor-wallet-hooks/useGetInstructorWallet';

function AvailableBalance() {
  const { data: wallet } = useGetInstructorWallet();

  const availableBalance = wallet?.balance ?? 0;
  const totalWithdrawn = wallet?.totalWithdrawn ?? 0;
  const pendingBalance = wallet?.pendingWithdrawal ?? 0;
  const currencySymbol = '$';

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
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <WalletIcon sx={{ color: (theme) => theme.palette.brand.main, fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Available balance
        </Typography>
      </Box>

      {/* Balance Amount */}
      <Box mb={3}>
        <Typography
          sx={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: (theme) => theme.palette.brand.main,
            mb: 1
          }}
        >
          {currencySymbol}{availableBalance.toLocaleString('en-US')}
          <Typography
            component="span"
            sx={{
              fontSize: '1.5rem',
              ml: 1,
              fontWeight: 600
            }}
          >
            USD
          </Typography>
        </Typography>
      </Box>

      {/* Details */}
      <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={3}
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          pt: 3
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5
            }}
            className="badge rounded-pill bg-warning text-dark"
          >
            Pending
          </Typography>
          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary
            }}
          >
            {currencySymbol}{pendingBalance.toLocaleString('en-US')}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 0.5
            }}
            className="badge rounded-pill bg-info text-dark"
          >
            Total withdrawn 
          </Typography>
          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary
            }}
          >
            {currencySymbol}{totalWithdrawn.toLocaleString('en-US')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default AvailableBalance;
