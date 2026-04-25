import { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, ToggleButton, ToggleButtonGroup, Divider, CircularProgress,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const DURATION_OPTIONS = [
    { label: "1 Day", value: 1, type: "suspend" },
    { label: "3 Days", value: 3, type: "suspend" },
    { label: "7 Days", value: 7, type: "suspend" },
    { label: "14 Days", value: 14, type: "suspend" },
    { label: "1 Month", value: 30, type: "suspend" },
    { label: "3 Months", value: 90, type: "suspend" },
    { label: "6 Months", value: 180, type: "suspend" },
    { label: "1 Year", value: 365, type: "suspend" },
    { label: "Permanent", value: null, type: "ban" },
];

export default function RestrictUserDialog({ open, onClose, user, isSaving, onConfirm }) {
    const [selected, setSelected] = useState(7);

    const selectedOption = DURATION_OPTIONS.find((o) => o.value === selected);
    const isPermanent = selected === null;

    const handleConfirm = () => {
        onConfirm({ durationDays: selected });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: "16px" } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BlockIcon sx={{ color: "error.main", fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Restrict User
                    </Typography>
                </Box>
                {user?.fullName && (
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25, display: "block" }}>
                        {user.fullName}
                    </Typography>
                )}
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2.5, pb: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.6 }}>
                    Select a restriction duration. The user will be unable to log in until the period ends.
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {DURATION_OPTIONS.map((opt) => {
                        const isActive = selected === opt.value;
                        const isPerma = opt.value === null;
                        return (
                            <Box
                                key={String(opt.value)}
                                onClick={() => setSelected(opt.value)}
                                sx={{
                                    px: 1.75, py: 0.75,
                                    borderRadius: "10px",
                                    border: "1.5px solid",
                                    borderColor: isActive
                                        ? (isPerma ? "error.main" : "brand.main")
                                        : "#E0E0E0",
                                    bgcolor: isActive
                                        ? (isPerma ? "error.lighter" : "brand.lighter")
                                        : "background.paper",
                                    color: isActive
                                        ? (isPerma ? "error.dark" : "brand.dark")
                                        : "text.secondary",
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "all 0.15s",
                                    display: "flex", alignItems: "center", gap: 0.5,
                                    "&:hover": {
                                        borderColor: isPerma ? "error.main" : "brand.main",
                                        bgcolor: isPerma ? "error.lighter" : "brand.lighter",
                                        color: isPerma ? "error.dark" : "brand.dark",
                                    },
                                }}
                            >
                                {isPerma
                                    ? <BlockIcon sx={{ fontSize: 13 }} />
                                    : <AccessTimeIcon sx={{ fontSize: 13 }} />
                                }
                                {opt.label}
                            </Box>
                        );
                    })}
                </Box>

                {/* Summary */}
                <Box sx={{ mt: 2.5, p: 1.5, borderRadius: "10px", bgcolor: isPermanent ? "error.lighter" : "brand.lighter", border: "1px solid", borderColor: isPermanent ? "error.light" : "brand.light" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isPermanent ? "error.dark" : "brand.dark", fontSize: "0.82rem" }}>
                        {isPermanent
                            ? "⚠️ This user will be permanently banned."
                            : `ℹ️ This user will be suspended for ${selectedOption?.label}.`}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={isSaving}
                    sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary", borderRadius: "10px" }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <BlockIcon fontSize="small" />}
                    sx={{
                        textTransform: "none", fontWeight: 700, borderRadius: "10px", px: 2.5,
                        bgcolor: isPermanent ? "error.main" : "brand.main",
                        "&:hover": { bgcolor: isPermanent ? "error.dark" : "brand.dark" },
                    }}
                >
                    {isPermanent ? "Ban Permanently" : "Suspend"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
