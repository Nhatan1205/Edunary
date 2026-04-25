import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Box, IconButton,
    Divider, CircularProgress, InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// ── Shared input focus style ────────────────────────────────────────────────────
const inputFocusSx = {
    "& label.Mui-focused": { color: "brand.dark" },
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        "&:hover fieldset": { borderColor: "brand.main" },
        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
    },
};

// ── Component ───────────────────────────────────────────────────────────────────

export default function AddUserDialog({ open, onClose, onSave, isSaving = false }) {
    const [showPassword, setShowPassword] = useState(false);

    const emptyValues = { fullName: "", phone: "", email: "", password: "" };

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: emptyValues,
    });

    // Reset form mỗi lần mở dialog
    useEffect(() => {
        if (open) {
            reset(emptyValues);
            setShowPassword(false);
        }
    }, [open]);

    const handleClose = () => {
        reset(emptyValues);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    boxShadow: "0px 8px 16px -4px rgba(16,24,40,0.12), 0px 20px 40px -8px rgba(16,24,40,0.10)",
                    overflow: "hidden",
                },
            }}
        >
            {/* ── Header ── */}
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2, px: 3, pb: 1.5 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: "10px",
                    bgcolor: "brand.lighter",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "brand.main" }} />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                    Add New User
                </Typography>

                <IconButton
                    size="small" onClick={handleClose}
                    sx={{ color: "#9CA3AF", borderRadius: "8px", "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSave)} autoComplete="off">
                <DialogContent sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                        Create a new user account. The user can change their password after logging in.
                    </Typography>

                    {/* Full Name */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            Full Name <Typography component="span" sx={{ color: "error.main", fontSize: "0.85rem" }}>*</Typography>
                        </Typography>
                        <TextField
                            {...register("fullName", {
                                required: "Full name is required",
                            })}
                            fullWidth size="small"
                            placeholder="e.g. John Doe"
                            error={!!errors.fullName}
                            autoFocus
                            autoComplete="off"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ fontSize: 18, color: "text.disabled" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: errors.fullName ? "error.main" : "#9CA3AF" }}>
                            {errors.fullName?.message ?? "The user's display name on the platform"}
                        </Typography>
                    </Box>

                    {/* Phone Number */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            Phone Number <Typography component="span" sx={{ color: "error.main", fontSize: "0.85rem" }}>*</Typography>
                        </Typography>
                        <TextField
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Please enter a valid 10-digit phone number",
                                },
                            })}
                            fullWidth size="small"
                            placeholder="e.g. 0912345678"
                            error={!!errors.phone}
                            autoComplete="off"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: errors.phone ? "error.main" : "#9CA3AF" }}>
                            {errors.phone?.message ?? "10-digit Vietnamese phone number"}
                        </Typography>
                    </Box>

                    {/* Email */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            Email <Typography component="span" sx={{ color: "error.main", fontSize: "0.85rem" }}>*</Typography>
                        </Typography>
                        <TextField
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9]+(?:[._-]?[A-Z0-9]+)+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                            fullWidth size="small"
                            type="email"
                            placeholder="e.g. john@example.com"
                            error={!!errors.email}
                            autoComplete="off"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: errors.email ? "error.main" : "#9CA3AF" }}>
                            {errors.email?.message ?? "Used as the login username"}
                        </Typography>
                    </Box>

                    {/* Password */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            Password <Typography component="span" sx={{ color: "error.main", fontSize: "0.85rem" }}>*</Typography>
                        </Typography>
                        <TextField
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters",
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                                    message: "Must include uppercase, lowercase, number, and special character",
                                },
                            })}
                            fullWidth size="small"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            error={!!errors.password}
                            autoComplete="new-password"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ fontSize: 18, color: "text.disabled" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((p) => !p)}
                                                edge="end" size="small"
                                                sx={{ color: "text.secondary", "&:hover": { color: "brand.main" } }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />
                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: errors.password ? "error.main" : "#9CA3AF" }}>
                            {errors.password?.message ?? "Uppercase, lowercase, number & special character"}
                        </Typography>
                    </Box>
                </DialogContent>

                <Divider sx={{ borderColor: "#F3F4F6" }} />

                {/* ── Footer ── */}
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        disabled={isSaving}
                        sx={{
                            textTransform: "none", fontWeight: 600,
                            color: "#6B7280", borderRadius: "10px", px: 2.5,
                            "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null}
                        sx={{
                            textTransform: "none", fontWeight: 600,
                            borderRadius: "10px", px: 3, boxShadow: "none",
                            bgcolor: "brand.main",
                            "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
                        }}
                    >
                        {isSaving ? "Creating..." : "Create User"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
