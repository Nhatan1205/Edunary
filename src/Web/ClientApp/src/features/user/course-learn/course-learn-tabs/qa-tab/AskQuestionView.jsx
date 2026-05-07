import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Button,
  TextField,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import TextEditor from "../../../../../components/TextEditor";
import { CURRENT_USER } from "./mockQAData";

const TITLE_MAX = 300;

// Minimal WYSIWYG buttons matching the Udemy-like image
const DETAIL_BUTTONS = [
  "bold", "italic", "|",
  "link", "image", "|",
  "source",
];

export default function AskQuestionView({ onSubmit, onBack, currentLectureName }) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  const canSubmit = title.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), detail });
  }

  return (
    <Box>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: "none",
            borderColor: "brand.main",
            color: "brand.main",
            fontWeight: 600,
            borderRadius: 2,
            fontSize: "0.8rem",
            py: 1,
            px: 2,
            "&:hover": { bgcolor: "background.muted", borderColor: "brand.dark" },
          }}
        >
          Back to All Questions
        </Button>
      </Box>

      {/* Page title */}
      <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
        Ask a new question
      </Typography>
      {currentLectureName && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: "block" }}>
          Asking in: <strong>{currentLectureName}</strong>
        </Typography>
      )}

      <Box sx={{ mt: 2 }}>
        {/* ── Title ── */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.8 }}>
            Title or summary <span style={{ color: "#d32f2f" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Why do we use fit_transform() for training_set?"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            inputProps={{ maxLength: TITLE_MAX }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              },
              "& .MuiInputBase-input": { pr: 5 },
            }}
            InputProps={{
              endAdornment: (
                <Typography
                  component="span"
                  variant="caption"
                  color={title.length > TITLE_MAX * 0.9 ? "warning.main" : "text.disabled"}
                  sx={{ whiteSpace: "nowrap", pr: 0.5, fontSize: "0.78rem" }}
                >
                  {TITLE_MAX - title.length}
                </Typography>
              ),
            }}
          />
        </Box>

        {/* ── Detail (WYSIWYG) ── */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.8 }}>
            Details{" "}
            <Typography component="span" variant="caption" color="text.disabled" fontWeight={400}>
              (optional)
            </Typography>
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              overflow: "hidden",
              "&:focus-within": { borderColor: "brand.main" },
              transition: "border-color 0.15s",
            }}
          >
            <TextEditor
              value={detail}
              onChange={(val) => setDetail(val)}
              buttons={DETAIL_BUTTONS}
            />
          </Box>
        </Box>

        {/* ── Publish button (full width, brand-colored) ── */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{
            bgcolor: canSubmit ? "brand.main" : "brand.light",
            color: "white",
            "&:hover": { bgcolor: "brand.dark" },
            "&:disabled": { bgcolor: "brand.light", color: "white", cursor: "not-allowed", pointerEvents: "auto" },
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            borderRadius: 2,
            py: 1.5,
            boxShadow: "none",
            transition: "all 0.2s",
          }}
        >
          Publish
        </Button>
      </Box>
    </Box>
  );
}
