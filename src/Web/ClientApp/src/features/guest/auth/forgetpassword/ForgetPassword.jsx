import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
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
} from '@mui/material';
import { EmailOutlined, ArrowForward } from '@mui/icons-material';
import useForgotPassword from '../../../../hooks/auth-hooks/useForgotPassword';
import LoadingSpinner from '../../../../components/LoadingSpinner';

function ForgetPassword() {
  const forgotPasswordMutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate(data.email);
  };

  if (forgotPasswordMutation.isPending) {
    return <LoadingSpinner fullScreen />;
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
                  Forgot Password
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Enter your email. If eligible, we send reset link.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: 'brand.main' }} />
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
                        borderColor: 'brand.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'brand.main',
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
                    background:
                      'linear-gradient(135deg, #00A76F 0%, #49BBBD 50%, #FF6B6B 100%)',
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
                    mb: 2,
                  }}
                >
                  Send Reset Link
                </Button>

                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Remember password?{' '}
                  <Typography
                    component={Link}
                    to="/login"
                    sx={{ color: 'brand.main', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Back to Login
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default ForgetPassword;
