import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router";
import signinImage from "../../../../assets/images/sign-in.jpg";
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
  // Checkbox,
  // FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowForward,
} from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import GitHubIcon from "@mui/icons-material/GitHub";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { GoogleLogin } from "@react-oauth/google";
import useLogin from "../../../../hooks/auth-hooks/useLogin";
import useGoogleLogin from "../../../../hooks/auth-hooks/useGoogleLogin";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  // const { handleGoogleLogin, isLoading: isGoogleLoading } = useGoogleLogin();
  const { handleGoogleLoginSuccess, handleGoogleLoginError, isLoading: isGoogleLoading } = useGoogleLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // Show loading spinner while logging in
  if (loginMutation.isPending || isGoogleLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Box
      sx={{
        minHeight: "90vh",
        // background:
        //   "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 25%, #FEF3C7 50%, #FED7AA 75%, #FECACA 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        py: 2,
        position: "relative",
        overflow: "hidden",
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 167, 111, 0.3) 0%, transparent 70%)",
          top: "-200px",
          left: "-200px",
          animation: "float 8s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          animation: "float 10s ease-in-out infinite reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(50px, 50px) scale(1.1)" },
        },
      }}
    >
      <Container component="main" maxWidth="md">
        <Fade in timeout={800}>
          <Card
            elevation={0}
            sx={{
              mt: "40px",
              borderRadius: 5,
              overflow: "hidden",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 32px 64px rgba(0, 167, 111, 0.2), 0 16px 32px rgba(255, 107, 107, 0.15)",
              border: "2px solid",
              borderColor: "rgba(255, 255, 255, 0.5)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, #00A76F 0%, #FFD93D 25%, #FF6B6B 50%, #A8E6CF 75%, #00A76F 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              },
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "200% 0" },
                "100%": { backgroundPosition: "-200% 0" },
              },
            }}
          >
            <Grid container>
              {/* Left side - Image */}
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  display: { xs: "none", md: "block" },
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "100%",
                    minHeight: "600px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={signinImage}
                    alt="Students studying"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                  {/* Dynamic Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(135deg, rgba(63, 204, 178, 0.4) 0%, rgba(255, 107, 107, 0.3) 50%, rgba(255, 217, 61, 0.3) 100%)",
                      mixBlendMode: "multiply",
                    }}
                  />
                  {/* Animated Shapes */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "20%",
                      right: "10%",
                      width: "100px",
                      height: "100px",
                      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                      background: "rgba(255, 217, 61, 0.5)",
                      animation: "morph 8s ease-in-out infinite",
                      "@keyframes morph": {
                        "0%, 100%": {
                          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                        },
                        "50%": {
                          borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
                        },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "30%",
                      left: "15%",
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(168, 230, 207, 0.5)",
                      animation: "pulse 4s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { transform: "scale(1)", opacity: 0.5 },
                        "50%": { transform: "scale(1.2)", opacity: 0.8 },
                      },
                    }}
                  />
                  {/* Welcome Card */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      left: 40,
                      right: 40,
                      p: 4,
                      borderRadius: 4,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 16px 48px rgba(0, 0, 0, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      transform: "translateY(0)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        background:
                          "linear-gradient(135deg, #00A76F 0%, #FF6B6B 50%, #FFD93D 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        mb: 1.5,
                        fontSize: "1.8rem",
                      }}
                    >
                      Welcome back!
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      Continue your learning journey and achieve your
                      educational goals.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right side - Form */}
              <Grid size={{ xs: 12, md: 6 }}>
                <CardContent
                  sx={{
                    p: { xs: 4, md: 6 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    minHeight: { md: "600px" },
                    position: "relative",
                  }}
                >
                  <Box sx={{ maxWidth: 420, width: "100%", mx: "auto" }}>
                    {/* Header */}
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                      <Typography
                        component="h1"
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          mb: 2,
                          fontSize: "2.5rem",
                          background:
                            "linear-gradient(135deg, #00A76F 0%, #FF6B6B 50%, #FFD93D 100%)",
                          backgroundSize: "200% auto",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          animation: "shine 3s linear infinite",
                          "@keyframes shine": {
                            "0%": { backgroundPosition: "0% center" },
                            "100%": { backgroundPosition: "200% center" },
                          },
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        Sign in to your account to continue
                      </Typography>
                    </Box>

                    <Box
                      component="form"
                      onSubmit={handleSubmit(onSubmit)}
                      sx={{ width: "100%" }}
                    >
                      {/* Form Fields */}
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          error={Boolean(errors.email)}
                          helperText={errors.email?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailOutlined
                                    sx={{
                                      color: "transparent",
                                      background:
                                        "linear-gradient(135deg, #00A76F 0%, #FF6B6B 100%)",
                                      backgroundClip: "text",
                                      WebkitBackgroundClip: "text",
                                      fontSize: 20,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 4px 12px rgba(0, 167, 111, 0.15)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#00A76F",
                                },
                              },
                              "&.Mui-focused": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 6px 16px rgba(0, 167, 111, 0.2)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#00A76F",
                                  borderWidth: "2px",
                                },
                              },
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                            pattern: {
                              value:
                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                              message:
                                "Password must include uppercase, lowercase, number, and special character",
                            },
                          })}
                          error={Boolean(errors.password)}
                          helperText={errors.password?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockOutlined
                                    sx={{
                                      color: "transparent",
                                      background:
                                        "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
                                      backgroundClip: "text",
                                      WebkitBackgroundClip: "text",
                                      fontSize: 20,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                    size="small"
                                    sx={{
                                      color: "text.secondary",
                                      "&:hover": {
                                        color: "#FF6B6B",
                                        transform: "scale(1.1)",
                                      },
                                      transition: "all 0.2s ease",
                                    }}
                                  >
                                    {showPassword ? (
                                      <VisibilityOff fontSize="small" />
                                    ) : (
                                      <Visibility fontSize="small" />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "white",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 4px 12px rgba(255, 107, 107, 0.15)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#FF6B6B",
                                },
                              },
                              "&.Mui-focused": {
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 6px 16px rgba(255, 107, 107, 0.2)",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#FF6B6B",
                                  borderWidth: "2px",
                                },
                              },
                            },
                          }}
                        />
                      </Box>

                      {/* Remember me and Forgot password */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        {/* <FormControlLabel
                          control={
                            <Checkbox
                              {...register("rememberMe")}
                              sx={{
                                color: "#3FCCB2",
                                "&.Mui-checked": {
                                  color: "#3FCCB2",
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(63, 204, 178, 0.1)",
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", fontWeight: 600 }}
                            >
                              Remember me
                            </Typography>
                          }
                        /> */}
                        <Link
                          to="/forget-password"
                          style={{
                            color: "#FF6B6B",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color = "#FFD93D";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color = "#FF6B6B";
                          }}
                        >
                          Forgot Password?
                        </Link>
                      </Box>

                      {/* Button Row - Sign In and Social Logins */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        {/* Submit Button */}
                        <Button
                          type="submit"
                          variant="contained"
                          size="medium"
                          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #00A76F 0%, #49BBBD 50%, #FF6B6B 100%)",
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
                          Sign In
                        </Button>

                        {/* Social Login Buttons */}
                        {/* <IconButton
                          onClick={() => handleGoogleLogin()}
                          sx={{
                            border: "2px solid",
                            borderColor: "rgba(234, 67, 53, 0.2)",
                            backgroundColor: "white",
                            borderRadius: 2,
                            width: 44,
                            height: 44,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#EA4335",
                              backgroundColor: "rgba(234, 67, 53, 0.05)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(234, 67, 53, 0.2)",
                            },
                          }}
                        >
                          <GoogleIcon sx={{ color: "#EA4335", fontSize: 22 }} />
                        </IconButton> */}
                        <Box sx={{
                          position: 'relative',
                          textAlign: 'center',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '50%',
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent 0%, #E0E0E0 50%, transparent 100%)',
                          }
                        }}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              backgroundColor: 'white',
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              position: 'relative',
                              zIndex: 1,
                            }}
                          >
                            OR
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                          {/* Hidden GoogleLogin */}
                          <Box sx={{
                            position: 'absolute',
                            opacity: 0,
                            pointerEvents: 'none',
                            '& > div': { display: 'none' }
                          }}>
                            <GoogleLogin
                              onSuccess={handleGoogleLoginSuccess}
                              onError={handleGoogleLoginError}
                            />
                          </Box>

                          {/* Custom Button */}
                          <IconButton
                            onClick={() => {
                              // Programmatically trigger Google login
                              const googleButton = document.querySelector('[aria-labelledby="button-label"]');
                              if (googleButton) googleButton.click();
                            }}
                            sx={{
                              border: "2px solid",
                              borderColor: "rgba(234, 67, 53, 0.2)",
                              backgroundColor: "white",
                              borderRadius: 2,
                              width: 64,
                              height: 44,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                borderColor: "#EA4335",
                                backgroundColor: "rgba(234, 67, 53, 0.05)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(234, 67, 53, 0.2)",
                              },
                            }}
                          >
                            <GoogleIcon sx={{ color: "#EA4335", fontSize: 22 }} />
                          </IconButton>
                        </Box>

                        {/* <IconButton
                          sx={{
                            border: "2px solid",
                            borderColor: "rgba(24, 119, 242, 0.2)",
                            backgroundColor: "white",
                            borderRadius: 2,
                            width: 44,
                            height: 44,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#1877F2",
                              backgroundColor: "rgba(24, 119, 242, 0.05)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(24, 119, 242, 0.2)",
                            },
                          }}
                        >
                          <FacebookIcon
                            sx={{ color: "#1877F2", fontSize: 22 }}
                          />
                        </IconButton>

                        <IconButton
                          sx={{
                            border: "2px solid",
                            borderColor: "rgba(51, 51, 51, 0.2)",
                            backgroundColor: "white",
                            borderRadius: 2,
                            width: 44,
                            height: 44,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "#333",
                              backgroundColor: "rgba(51, 51, 51, 0.05)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(51, 51, 51, 0.2)",
                            },
                          }}
                        >
                          <GitHubIcon sx={{ color: "#333", fontSize: 22 }} />
                        </IconButton> */}
                      </Box>

                      {/* Sign Up Link */}
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="body1"
                          sx={{ color: "text.secondary", fontWeight: 600 }}
                        >
                          New here?{" "}
                          <Link
                            to="/register"
                            style={{
                              background:
                                "linear-gradient(135deg, #00A76F 0%, #FF6B6B 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              textDecoration: "none",
                              fontWeight: 800,
                              fontSize: "1rem",
                              transition: "all 0.3s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.textDecoration = "underline";
                              e.target.style.textDecorationColor = "#00A76F";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.textDecoration = "none";
                            }}
                          >
                            Create an account!
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
