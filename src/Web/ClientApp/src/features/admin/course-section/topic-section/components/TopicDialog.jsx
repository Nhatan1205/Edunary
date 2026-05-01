import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    IconButton,
    Divider,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

const inputFocusSx = {
    "& label.Mui-focused": { color: "brand.dark" },
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        "&:hover fieldset": { borderColor: "brand.main" },
        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
    },
};

export default function TopicDialog({
    open,
    onClose,
    mode = "create",
    topic = null,
    onSave,
    isSaving = false,
}) {
    const isCreate = mode === "create";

    const emptyValues = { name: "" };

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        values: isCreate ? emptyValues : { name: topic?.name ?? "" },
    });

    const onSubmit = (data) => {
        onSave(data, mode);
    };

    const handleClose = () => {
        reset(emptyValues);
        onClose();
    };

    const nameLength = watch("name")?.length ?? 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    boxShadow:
                        "0px 8px 16px -4px rgba(16,24,40,0.12), 0px 20px 40px -8px rgba(16,24,40,0.10)",
                    overflow: "hidden",
                },
            }}
        >
            {/* ── Header ── */}
            <DialogTitle
                component="div"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 2,
                    px: 3,
                    pb: 1.5,
                }}
            >
                {/* Icon badge */}
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: "rgba(0,167,111,0.10)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <LocalOfferOutlinedIcon sx={{ fontSize: 20, color: "brand.main" }} />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                    {isCreate ? "New Topic" : "Edit Topic"}
                </Typography>

                <IconButton
                    size="small"
                    onClick={handleClose}
                    sx={{
                        color: "#9CA3AF",
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ borderColor: "#F3F4F6" }} />

            {/* ── Form ── */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Typography variant="body2" sx={{ color: "#6B7280", lineHeight: 1.6 }}>
                        {isCreate
                            ? "Add a new course topic tag to the platform."
                            : "You are editing an existing topic. Only the name can be changed here."}
                    </Typography>

                    {/* Topic Name field */}
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}>
                            Topic Name
                            <Typography component="span" sx={{ color: "error.main", ml: 0.5, fontSize: "0.85rem" }}>
                                *
                            </Typography>
                        </Typography>

                        <TextField
                            {...register("name", {
                                required: "Topic name is required",
                                minLength: { value: 2, message: "Name must be at least 2 characters" },
                                maxLength: { value: 60, message: "Name cannot exceed 60 characters" },
                            })}
                            fullWidth
                            size="small"
                            placeholder="e.g. Machine Learning"
                            error={!!errors.name}
                            autoFocus
                            slotProps={{
                                htmlInput: { maxLength: 60 },
                                input: {
                                    endAdornment: (
                                        <Typography variant="caption" sx={{ color: "#9CA3AF", whiteSpace: "nowrap", ml: 1 }}>
                                            {nameLength}/60
                                        </Typography>
                                    ),
                                },
                            }}
                            sx={inputFocusSx}
                        />

                        {errors.name ? (
                            <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "error.main" }}>
                                {errors.name.message}
                            </Typography>
                        ) : (
                            <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "#9CA3AF" }}>
                                A short, descriptive name for this topic tag
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <Divider sx={{ borderColor: "#F3F4F6" }} />

                {/* ── Footer ── */}
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        disabled={isSaving}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "#6B7280",
                            borderRadius: "10px",
                            px: 2.5,
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
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "10px",
                            px: 3,
                            boxShadow: "none",
                            bgcolor: "brand.main",
                            "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: "#D1D5DB", color: "#9CA3AF" },
                        }}
                    >
                        {isSaving
                            ? isCreate ? "Creating..." : "Saving..."
                            : isCreate ? "Create" : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
