import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
} from "@mui/icons-material";
import { Container } from "reactstrap";
import useChangePassword from "../../../../hooks/useChangePassword";
import useGetBasicUserInfo from "../../../../hooks/useGetBasicUserInfor";

const textFieldSx = {
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "brand.main" },
    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
  },
};

const passwordRequirements = [
  { label: "At least 8 characters", test: (pwd) => pwd?.length >= 8 },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
  { label: "One special character", test: (pwd) => /[!@#$%^&*]/.test(pwd) },
];

function AccountSecurityPage() {
  const { data: userInfo } = useGetBasicUserInfo();
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
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useChangePassword(() => {
    reset();
  });

  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Container className="py-2 px-0">
      {/* Page Header */}
      <Box
        sx={{
          textAlign: "center",
          mb: 3,
          px: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Account
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Edit your account settings and change your password here.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 6 }}>
        {/* Email Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Email:
          </Typography>
          <TextField
            fullWidth
            readOnly
            value={`Your email address is ${userInfo?.email || ""}`}
            size="small"
            sx={{
              ...textFieldSx,
              "& .MuiOutlinedInput-root": {
                bgcolor: "action.hover",
                pointerEvents: "none",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Old Password */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Old password
          </Typography>
          <TextField
            {...register("oldPassword", {
              required: "Current password is required",
            })}
            fullWidth
            type={showOldPassword ? "text" : "password"}
            placeholder="Enter old password"
            size="small"
            variant="outlined"
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
            sx={textFieldSx}
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
          />
        </Box>

        {/* New Password */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            New password
          </Typography>
          <TextField
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
            fullWidth
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter new password"
            size="small"
            variant="outlined"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            sx={textFieldSx}
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
          />
          {/* Password Requirements */}
          {newPassword && (
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                bgcolor: "background.muted",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Password Requirements:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {passwordRequirements.map((req, index) => {
                  const isMet = req.test(newPassword);
                  return (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
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
        </Box>

        {/* Confirm New Password */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Confirm new password
          </Typography>
          <TextField
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-type new password"
            size="small"
            variant="outlined"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={textFieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      sx={{ color: "text.tertiary" }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Submit Button */}
        <Box>
          <Button
            variant="contained"
            type="submit"
            size="large"
            disabled={changePasswordMutation.isPending}
            sx={{
              bgcolor: "brand.main",
              "&:hover": {
                backgroundColor: "brand.dark",
              },
              "&:disabled": {
                bgcolor: "text.disabled",
                color: "background.paper",
              },
              fontWeight: 600,
            }}
          >
            Change password
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AccountSecurityPage;