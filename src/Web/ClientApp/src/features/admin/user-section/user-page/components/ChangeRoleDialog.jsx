import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, IconButton, Divider,
    CircularProgress, MenuItem, Select, FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";

// ── Available roles ─────────────────────────────────────────────────────────────
const ROLES = ["User", "Administrator"];

// ── Shared input focus style ────────────────────────────────────────────────────
const selectSx = {
    borderRadius: "10px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main", borderWidth: "2px" },
};


export default function ChangeRoleDialog({ open, onClose, onSave, isSaving = false, user = null }) {
    const currentRole = user?.roles?.[0] ?? "User";

    const { control, handleSubmit, reset } = useForm({
        defaultValues: { newRole: currentRole },
    });

    // Reset về role hiện tại mỗi lần mở dialog
    useEffect(() => {
        if (open) reset({ newRole: currentRole });
    }, [open, currentRole]);

    const handleClose = () => {
        reset({ newRole: currentRole });
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
                    <ManageAccountsOutlinedIcon sx={{ fontSize: 20, color: "brand.main" }} />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                    Change Role
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
            <form onSubmit={handleSubmit(onSave)}>
                <DialogContent sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                        Change the role for{" "}
                        <Typography component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {user?.fullName ?? "this user"}
                        </Typography>
                        . Their current role is{" "}
                        <Typography component="span" sx={{ fontWeight: 600, color: "brand.main" }}>
                            {currentRole}
                        </Typography>
                        .
                    </Typography>

                    {/* Role Dropdown */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            New Role
                            <Typography component="span" sx={{ color: "error.main", ml: 0.5, fontSize: "0.85rem" }}>*</Typography>
                        </Typography>

                        <FormControl fullWidth size="small">
                            <Controller
                                name="newRole"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select {...field} sx={selectSx}>
                                        {ROLES.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>

                        <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#9CA3AF" }}>
                            This will immediately update the user's permissions.
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
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
