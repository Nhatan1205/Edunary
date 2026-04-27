import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  CircularProgress,
  Fade
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, ArrowForward } from '@mui/icons-material';
import useVerifyRegistration from '../../../../hooks/auth-hooks/useVerifyRegistration';

const VerifyRegistration = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useVerifyRegistration(token);

  const status = isLoading ? 'loading' : (data?.succeeded && !isError ? 'success' : 'error');
  const message = data?.message ?? 'Verification link is invalid or expired.';

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Fade in timeout={800}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'brand.lighter'
          }}
        >
          {status === 'loading' && (
            <Box sx={{ py: 4 }}>
              <CircularProgress sx={{ color: 'brand.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Verifying your account...
              </Typography>
            </Box>
          )}

          {status === 'success' && (
            <Box sx={{ py: 4 }}>
              <CheckCircleOutline sx={{ fontSize: 64, color: 'brand.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'brand.main' }}>
                Verification Successful!
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                {message}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: 'brand.main',
                  '&:hover': { backgroundColor: 'brand.dark' },
                  px: 4, py: 1.5, borderRadius: 2, fontWeight: 600
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}

          {status === 'error' && (
            <Box sx={{ py: 4 }}>
              <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
                Verification Failed
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                {message}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': { borderColor: 'error.dark', backgroundColor: 'error.lighter' },
                  px: 4, py: 1.5, borderRadius: 2, fontWeight: 600
                }}
              >
                Return to Register
              </Button>
            </Box>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default VerifyRegistration;

