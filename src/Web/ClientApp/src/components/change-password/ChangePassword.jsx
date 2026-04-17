import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Close, Visibility, VisibilityOff, LockOutlined, CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import useChangePassword from "../../hooks/auth-hooks/useChangePassword";

function ChangePassword({ open, onClose, isFirstLogin = false, defaultPassword = "" }) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      oldPassword: defaultPassword,
    },
  });

  const changePasswordMutation = useChangePassword(() => {
    reset();
    onClose();
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Password strength indicators
  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd) => pwd?.length >= 8 },
    { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { label: "One number", test: (pwd) => /\d/.test(pwd) },
    { label: "One special character", test: (pwd) => /[!@#$%^&*]/.test(pwd) },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(15, 43, 42, 0.12)",
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.palette.brand.dark} 0%, ${theme.palette.brand.main} 100%)`,
          color: "text.inverse",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2.5,
          px: 3,
        })}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" component="span" fontWeight={600}>
            Change Password
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "text.inverse",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.15)",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 3, pb: 2, px: 3, bgcolor: "background.default" }}>
          {/* First Login Warning */}
          {isFirstLogin && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#FFF4E6",
                borderRadius: 1.5,
                border: "1px solid #FFD699",
              }}
            >
              <Typography variant="body2" color="#B54708" fontWeight={500}>
                For your security reasons, please change your password. You can close this window and change your password later. (Not
                recommended)
              </Typography>
            </Box>
          )}

          {/* Old Password - Hidden for first login */}
          {!isFirstLogin && (
            <TextField
              fullWidth
              label="Current Password"
              type={showOldPassword ? "text" : "password"}
              margin="normal"
              {...register("oldPassword", {
                required: "Current password is required",
              })}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                        sx={{ color: "text.tertiary" }}
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  "&:hover": {
                    bgcolor: "background.surface",
                  },
                  "&.Mui-focused": {
                    bgcolor: "background.paper",
                  },
                },
              }}
            />
          )}

          {!isFirstLogin && <Divider sx={{ my: 2.5, borderColor: "divider" }} />}

          {/* New Password */}
          <TextField
            fullWidth
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            margin="normal"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                message:
                  "Password must include uppercase, lowercase, number, and special character",
              },
            })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      sx={{ color: "text.tertiary" }}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                "&:hover": {
                  bgcolor: "background.surface",
                },
                "&.Mui-focused": {
                  bgcolor: "background.paper",
                },
              },
            }}
          />

          {/* Password Requirements */}
          {newPassword && (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                bgcolor: "background.muted",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Password Requirements:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {passwordRequirements.map((req, index) => {
                  const isMet = req.test(newPassword);
                  return (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleOutline
                        sx={{
                          fontSize: 16,
                          color: isMet ? "brand.main" : "text.disabled",
                          transition: "color 0.2s",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: isMet ? "text.primary" : "text.disabled",
                          transition: "color 0.2s",
                        }}
                      >
                        {req.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            margin="normal"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: "text.tertiary" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                "&:hover": {
                  bgcolor: "background.surface",
                },
                "&.Mui-focused": {
                  bgcolor: "background.paper",
                },
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "background.paper", gap: 1.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: "divider",
              color: "text.primary",
              px: 3,
              py: 1,
              "&:hover": {
                borderColor: "text.tertiary",
                bgcolor: "background.alt",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={changePasswordMutation.isPending}
            sx={{
              bgcolor: "brand.main",
              color: "text.inverse",
              px: 3,
              py: 1,
              boxShadow: "0 2px 8px rgba(63, 204, 178, 0.3)",
              "&:hover": {
                bgcolor: "brand.dark",
                boxShadow: "0 4px 12px rgba(63, 204, 178, 0.4)",
              },
              "&:disabled": {
                bgcolor: "text.disabled",
                color: "background.paper",
              },
            }}
          >
            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangePassword;