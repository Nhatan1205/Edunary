import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Container } from "reactstrap";

const mockEmail = "nguyenmaihuyhoang312@gmail.com";

const textFieldSx = {
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "brand.main" },
    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
  },
};

function AccountSecurityPage() {
  const {
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
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
            value={`Your email address is ${mockEmail}`}
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
            {...register("oldPassword")}
            fullWidth
            type="password"
            placeholder="Enter old password"
            size="small"
            variant="outlined"
            sx={textFieldSx}
          />
        </Box>

        {/* New Password */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            New password
          </Typography>
          <TextField
            {...register("newPassword")}
            fullWidth
            type="password"
            placeholder="Enter new password"
            size="small"
            variant="outlined"
            sx={textFieldSx}
          />
        </Box>

        {/* Confirm New Password */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Confirm new password
          </Typography>
          <TextField
            {...register("confirmPassword")}
            fullWidth
            type="password"
            placeholder="Re-type new password"
            size="small"
            variant="outlined"
            sx={textFieldSx}
          />
        </Box>

        {/* Submit Button */}
        <Box>
          <Button
            variant="contained"
            type="submit"
            size="large"
            sx={{
              bgcolor: "brand.main",
              "&:hover": {
                backgroundColor: "brand.dark",
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
