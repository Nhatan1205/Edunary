import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import signinImage from '../../../../assets/images/sign-in.jpg';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Fade,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, ArrowForward } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Handle login logic here
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box sx={{ 
      minHeight: '100vh',
    //   background: 'linear-gradient(135deg, #F7FBFA 0%, #EFF7F6 100%)',
      py: 1
    }}>
      <Container component="main" maxWidth="lg">
        <Fade in timeout={800}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: 'background.paper',
              boxShadow: '0 24px 48px rgba(15, 43, 42, 0.08), 0 8px 24px rgba(15, 43, 42, 0.04)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Grid container>
              {/* Left side - Image */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ 
                display: { xs: 'none', md: 'block' },
                position: 'relative'
              }}>
                <Box sx={{ 
                  position: 'relative',
                  height: '100%',
                  minHeight: '600px',
                  overflow: 'hidden'
                }}>
                  <Box
                    component="img"
                    src={signinImage}
                    alt="Students studying"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                  {/* Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(63, 204, 178, 0.1) 0%, rgba(73, 187, 189, 0.1) 100%)',
                  }} />
                  {/* Decorative Elements */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: 40,
                    right: 40,
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(15, 43, 42, 0.15)',
                  }}>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
                      Welcome back!
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Continue your learning journey and achieve your educational goals with us.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right side - Form */}
              <Grid size={{ xs: 12, md: 6 }}>
                <CardContent sx={{ 
                  p: { xs: 4, md: 6 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: { md: '600px' }
                }}>
                  <Box sx={{ maxWidth: 420, width: '100%', mx: 'auto' }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography 
                        component="h1" 
                        variant="h3" 
                        sx={{ 
                          color: 'text.primary',
                          fontWeight: 700,
                          mb: 1,
                          background: 'linear-gradient(135deg, #3FCCB2 0%, #49BBBD 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textAlign: 'center'
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}
                      >
                        Sign in to your account to continue
                      </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                      {/* Form Fields */}
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Email"
                          type="email"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          error={Boolean(errors.email)}
                          helperText={errors.email?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailOutlined sx={{ color: 'brand.main', fontSize: 18 }} />
                                </InputAdornment>
                              ),
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: 'background.muted',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'background.surface',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'brand.light',
                                }
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'background.surface',
                                boxShadow: '0 0 0 3px rgba(63, 204, 178, 0.1)',
                              }
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                          error={Boolean(errors.password)}
                          helperText={errors.password?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockOutlined sx={{ color: 'brand.main', fontSize: 18 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                    size="small"
                                    sx={{ 
                                      color: 'text.secondary',
                                      '&:hover': { color: 'brand.main' }
                                    }}
                                  >
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1.5,
                              backgroundColor: 'background.muted',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'background.surface',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'brand.light',
                                }
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'background.surface',
                                boxShadow: '0 0 0 3px rgba(63, 204, 178, 0.1)',
                              }
                            }
                          }}
                        />
                      </Box>

                      {/* Remember me and Forgot password */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <FormControlLabel
                          control={
                            <Checkbox 
                              {...register('rememberMe')}
                              sx={{
                                color: 'brand.main',
                                '&.Mui-checked': {
                                  color: 'brand.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Remember me
                            </Typography>
                          }
                        />
                        <Link
                          to="/forget-password"
                          style={{
                            color: '#3FCCB2',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = '#49BBBD';
                            e.target.style.textDecoration = 'underline';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = '#3FCCB2';
                            e.target.style.textDecoration = 'none';
                          }}
                        >
                          Forgot Password?
                        </Link>
                      </Box>

                      {/* Buttons Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        {/* Submit Button */}
                        <Button
                          type="submit"
                          variant="contained"
                          size="medium"
                          endIcon={
                            <ArrowForward sx={{ fontSize: 14, color: 'white' }} />
                          }
                          sx={{
                            minWidth: 140,
                            px: 3,
                            py: 1.5,
                            borderRadius: 25,
                            background: 'linear-gradient(135deg, #3FCCB2 0%, #49BBBD 100%)',
                            boxShadow: '0 4px 12px rgba(63, 204, 178, 0.3)',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 16px rgba(63, 204, 178, 0.4)',
                              background: 'linear-gradient(135deg, #49BBBD 0%, #3FCCB2 100%)',
                              '& .MuiButton-endIcon > div': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                transform: 'scale(1.1)',
                              }
                            },
                            '& .MuiButton-endIcon': {
                              marginLeft: 1,
                              transition: 'transform 0.3s ease',
                            },
                            '&:hover .MuiButton-endIcon': {
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          Sign In
                        </Button>

                        {/* Divider */}
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          or sign in with
                        </Typography>

                        {/* Social Login Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: 'background.surface',
                              borderRadius: 1.5,
                              width: 44,
                              height: 44,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'brand.light',
                                backgroundColor: 'background.muted',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(63, 204, 178, 0.1)',
                              }
                            }}
                          >
                            <GoogleIcon sx={{ color: '#EA4335', fontSize: 20 }} />
                          </IconButton>

                          <IconButton
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: 'background.surface',
                              borderRadius: 1.5,
                              width: 44,
                              height: 44,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'brand.light',
                                backgroundColor: 'background.muted',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(63, 204, 178, 0.1)',
                              }
                            }}
                          >
                            <FacebookIcon sx={{ color: '#1877F2', fontSize: 20 }} />
                          </IconButton>

                          <IconButton
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: 'background.surface',
                              borderRadius: 1.5,
                              width: 44,
                              height: 44,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'brand.light',
                                backgroundColor: 'background.muted',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(63, 204, 178, 0.1)',
                              }
                            }}
                          >
                            <GitHubIcon sx={{ color: '#333', fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Sign Up Link */}
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Don't have an account?{' '}
                          <Link
                            to="/register"
                            style={{
                              color: '#3FCCB2',
                              textDecoration: 'none',
                              fontWeight: 600,
                              transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                              e.target.style.color = '#49BBBD';
                              e.target.style.textDecoration = 'underline';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.color = '#3FCCB2';
                              e.target.style.textDecoration = 'none';
                            }}
                          >
                            Sign Up
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Login;