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
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

// ── Shared input focus style (same convention as RoadmapMetaDialog) ──
const inputFocusSx = {
  "& label.Mui-focused": { color: "brand.dark" },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "&:hover fieldset": { borderColor: "brand.main" },
    "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "2px" },
  },
};


export default function CategoryDialog({
  open,
  onClose,
  mode = "create",
  category = null,
  onSave,
  isSaving = false,
}) {
  const isCreate = mode === "create";

  const emptyValues = { title: "" };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    values: isCreate ? emptyValues : { title: category?.title ?? "" },
  });

  const onSubmit = (data) => {
    onSave(data, mode);
  };

  const handleClose = () => {
    reset(emptyValues);
    onClose();
  };

  const titleLength = watch("title")?.length ?? 0;

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
          <CategoryOutlinedIcon sx={{ fontSize: 20, color: "brand.main" }} />
        </Box>

        {/* Title */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
          {isCreate ? "New Category" : "Edit Category"}
        </Typography>

        {/* Close button */}
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
              ? "Add a new course category to the platform."
              : "You are editing an existing category. Only the name can be changed here."}
          </Typography>

          {/* Category Name field */}
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, fontWeight: 600, color: "#374151" }}
            >
              Category Name
              <Typography
                component="span"
                sx={{ color: "error.main", ml: 0.5, fontSize: "0.85rem" }}
              >
                *
              </Typography>
            </Typography>

            <TextField
              {...register("title", {
                required: "Category name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
                maxLength: {
                  value: 60,
                  message: "Name cannot exceed 60 characters",
                },
              })}
              fullWidth
              size="small"
              placeholder="e.g. Web Development"
              error={!!errors.title}
              autoFocus
              slotProps={{
                htmlInput: { maxLength: 60 },
                input: {
                  endAdornment: (
                    <Typography
                      variant="caption"
                      sx={{ color: "#9CA3AF", whiteSpace: "nowrap", ml: 1 }}
                    >
                      {titleLength}/60
                    </Typography>
                  ),
                },
              }}
              sx={inputFocusSx}
            />

            {/* Validation error */}
            {errors.title ? (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: "error.main" }}
              >
                {errors.title.message}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, display: "block", color: "#9CA3AF" }}
              >
                A short, descriptive name for this course category
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
            startIcon={
              isSaving ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : null
            }
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
    </Dialog >
  );
}
