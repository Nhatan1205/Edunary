import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TextEditor from "../../../../../components/TextEditor";
import useCreateCourseQuestion from "../../../../../hooks/course-qa-hooks/useCreateCourseQuestion";

const TITLE_MAX = 300;

const DETAIL_BUTTONS = [
  "bold", "italic", "|",
  "link", "image", "|",
  "source",
];

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function AskQuestionView({ courseId, itemId, onBack, onSuccess, currentLectureName }) {
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { title: "", detail: "" },
  });

  const titleValue = watch("title", "");
  const createQuestion = useCreateCourseQuestion();

  function onSubmit({ title, detail }) {
    createQuestion.mutate(
      { courseId, itemId, title: title.trim(), detail: detail || null },
      { onSuccess: () => onSuccess?.() }
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          type="button"
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
            inputProps={{ maxLength: TITLE_MAX }}
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register("title", { required: "Title is required", maxLength: TITLE_MAX })}
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
                  color={titleValue.length > TITLE_MAX * 0.9 ? "warning.main" : "text.disabled"}
                  sx={{ whiteSpace: "nowrap", pr: 0.5, fontSize: "0.78rem" }}
                >
                  {TITLE_MAX - titleValue.length}
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
            <Controller
              name="detail"
              control={control}
              render={({ field }) => (
                <TextEditor
                  value={field.value}
                  onChange={field.onChange}
                  buttons={DETAIL_BUTTONS}
                />
              )}
            />
          </Box>
        </Box>

        {/* ── Publish button ── */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={createQuestion.isPending}
          sx={{
            bgcolor: "brand.main",
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
          {createQuestion.isPending ? "Publishing..." : "Publish"}
        </Button>
      </Box>
    </Box>
  );
}
