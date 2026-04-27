import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowForward,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import useResetPassword from '../../../../hooks/auth-hooks/useResetPassword';

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setTimeout(() => navigate('/login'), 1200);
    },
  });

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({
      email,
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  if (!email || !token) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Fade in timeout={800}>
          <Card sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              Invalid Reset Link
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              Password reset link is invalid or expired.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/forget-password')} 
              sx={{ textTransform: "none", backgroundColor: 'brand.main',
              '&:hover': { backgroundColor: 'brand.dark' }, }} 
            >
              Request New Link
            </Button>
          </Card>
        </Fade>
      </Container>
    );
  }

  if (resetPasswordMutation.isPending) {
    return <LoadingSpinner fullScreen />;
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Fade in timeout={800}>
          <Card sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            <CheckCircleOutline sx={{ fontSize: 64, color: 'brand.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              Password Reset Successful
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Redirecting to login...
            </Typography>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '90vh',
        background:
          'linear-gradient(135deg, rgba(0, 167, 111, 0.06) 0%, rgba(255, 59, 59, 0.05) 50%, rgba(255, 193, 7, 0.06) 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        py: 6,
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              mt: '60px',
              borderRadius: 5,
              backgroundColor: 'background.paper',
              backdropFilter: 'blur(20px)',
              boxShadow: (theme) =>
                `0 32px 64px ${theme.palette.brand.light}33, 0 16px 32px ${theme.palette.error.light}26`,
              border: '1px solid',
              borderColor: 'brand.lighter',
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1.5,
                    background:
                      'linear-gradient(135deg, #00A76F 0%, #FF3B3B 50%, #FFC107 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Reset Password
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Set new password for {email}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  size="small"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                      message: 'Password must include uppercase, lowercase, number, and special character',
                    },
                  })}
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: 'brand.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'brand.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'brand.main',
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === watch('newPassword') || 'Password confirmation does not match',
                  })}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: 'error.light' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end" size="small">
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.light',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'error.light',
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00A76F 0%, #49BBBD 50%, #FF6B6B 100%)',
                    backgroundSize: "200% auto",
                    boxShadow: "0 4px 16px rgba(0, 167, 111, 0.3)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0, 167, 111, 0.4)",
                      backgroundPosition: "right center",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Reset Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default ResetPassword;
