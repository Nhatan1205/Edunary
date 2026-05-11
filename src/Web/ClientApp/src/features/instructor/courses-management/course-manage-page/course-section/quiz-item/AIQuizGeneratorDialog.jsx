import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Stack, TextField,
  Checkbox, FormControlLabel, FormGroup, RadioGroup, Radio,
  FormControl, FormLabel, LinearProgress, Alert, Divider, Chip,
  Select, MenuItem, InputLabel,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import useGenerateQuizQuestions from "../../../../../../hooks/quiz-hooks/useGenerateQuizQuestions";

const QUESTION_TYPE_OPTIONS = [
  { value: "SingleChoice", label: "Single Choice" },
  { value: "MultipleChoice", label: "Multiple Choice" },
  { value: "TrueFalse", label: "True / False" },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

/**
 * AIQuizGeneratorDialog
 *
 * generating/progress/pendingResult are LIFTED to QuizEditor so the SignalR
 * listener survives dialog close. This dialog is purely presentational for
 * those states.
 *
 * @param {boolean}  generating      - Controlled by QuizEditor
 * @param {function} setGenerating   - Controlled by QuizEditor
 * @param {object}   progress        - { percent, message, questions } from SignalR
 * @param {Array}    pendingResult   - Questions received while dialog was closed
 * @param {function} clearPendingResult
 */
export default function AIQuizGeneratorDialog({
  open, onClose, item, courseId, relatedItemId: defaultRelatedItemId = "",
  sections = [], onApply,
  generating, setGenerating, progress, pendingResult, clearPendingResult,
}) {
  // ── Form state ───────────────────────────────────────────────────────────────
  const [selectedRelatedItemId, setSelectedRelatedItemId] = useState(defaultRelatedItemId);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionTypes, setQuestionTypes] = useState(["SingleChoice", "MultipleChoice", "TrueFalse"]);
  const [promptDescription, setPromptDescription] = useState("");
  const [applyMode, setApplyMode] = useState("replace");
  const [error, setError] = useState("");

  const generateMutation = useGenerateQuizQuestions();

  // pendingResult = completed while dialog was closed → treat as "done" immediately
  const isDone = pendingResult
    || (generating && progress?.percent === 100 && progress?.questions);
  const isError = generating && progress?.percent === -1;
  const activeQuestions = pendingResult || progress?.questions;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleTypeToggle = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!selectedRelatedItemId) {
      setError("Please select a lecture to analyze.");
      return;
    }
    if (questionTypes.length === 0) {
      setError("Select at least one question type.");
      return;
    }

    setError("");
    setGenerating(true);

    try {
      await generateMutation.mutateAsync({
        courseId,
        itemId: item.itemId,
        relatedItemId: selectedRelatedItemId,
        numQuestions,
        questionTypes,
        difficulty,
        promptDescription,
      });
    } catch (e) {
      setError("Failed to start generation. Please try again.");
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!activeQuestions) return;
    // console.log("questions: ", activeQuestions)
    onApply(activeQuestions, applyMode);
    clearPendingResult?.();
    setGenerating(false);
    handleClose();
  };

  const handleClose = () => {
    setError("");
    // If errored, stop the generating state so the button resets outside
    if (isError) setGenerating(false);
    onClose();
  };

  const handleTryAgain = () => {
    clearPendingResult?.();
    setGenerating(false);
  };

  // ── Lecture options ─────────────────────────────────────────────────────────
  const lectureItems = sections.flatMap((s) =>
    (s.items || []).filter((i) => i.itemId !== item.itemId && i.type !== "quiz")
  );

  // ── UI ───────────────────────────────────────────────────────────────────────
  const progressColor = isError ? "error" : isDone ? "success" : "primary";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #f8faff 0%, #fff 100%)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: 2,
                background: "linear-gradient(135deg, #00A76F, #00B87A)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize={16}>AI Quiz Generator</Typography>
              <Typography variant="caption" color="text.secondary">
                Powered by multi-agent AI
              </Typography>
            </Box>
          </Stack>
          <Button size="small" onClick={handleClose} sx={{ minWidth: 0, p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{
        pt: 2.5,
        "& .MuiOutlinedInput-root": {
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "brand.main" },
      }}>
        {/* ── Progress state ── */}
        {generating && (
          <Box mb={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              {!isError && (
                <Typography variant="body2" fontWeight={500} color={isDone ? "success.main" : "text.primary"}>
                  {progress?.message}
                </Typography>
              )}
              {progress?.percent >= 0 && !isError && (
                <Typography variant="caption" color="text.secondary">
                  {progress.percent}%
                </Typography>
              )}
            </Stack>
            <LinearProgress
              variant={progress?.percent <= 0 ? "indeterminate" : "determinate"}
              value={Math.max(0, progress?.percent ?? 0)}
              color={progressColor}
              sx={{ borderRadius: 1, height: 6 }}
            />
            {isDone && (
              <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 1.5 }}>
                Generated <strong>{activeQuestions?.length}</strong> questions successfully!
              </Alert>
            )}
            {isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                {progress?.message}
              </Alert>
            )}
          </Box>
        )}

        {/* ── Config form (hidden once done) ── */}
        {!isDone && (
          <Box sx={{ opacity: generating ? 0.5 : 1, pointerEvents: generating ? "none" : "auto" }}>
            {/* Lecture selector */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="ai-lecture-label">Lecture to Analyze *</InputLabel>
              <Select
                labelId="ai-lecture-label"
                value={selectedRelatedItemId}
                label="Lecture to Analyze *"
                onChange={(e) => setSelectedRelatedItemId(e.target.value)}
              >
                <MenuItem value="">-- Select a lecture --</MenuItem>
                {lectureItems.map((i) => (
                  <MenuItem key={i.itemId} value={i.itemId}>
                    {i.title || i.itemId}
                    <Chip
                      label={i.type}
                      size="small"
                      sx={{ ml: 1, height: 18, fontSize: 10 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Question count + difficulty */}
            <Stack direction="row" gap={2} mb={2}>
              <TextField
                size="small"
                label="Number of Questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.min(20, Math.max(1, Number(e.target.value))))}
                inputProps={{ min: 1, max: 20 }}
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel id="ai-diff-label">Difficulty</InputLabel>
                <Select
                  labelId="ai-diff-label"
                  value={difficulty}
                  label="Difficulty"
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Question types */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend" sx={{ fontSize: 13, mb: 0.5 }}>
                Question Types
              </FormLabel>
              <FormGroup row>
                {QUESTION_TYPE_OPTIONS.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        size="small"
                        checked={questionTypes.includes(value)}
                        onChange={() => handleTypeToggle(value)}
                        sx={{ "&.Mui-checked": { color: "brand.main" } }}
                      />
                    }
                    label={<Typography variant="body2">{label}</Typography>}
                  />
                ))}
              </FormGroup>
            </FormControl>

            {/* Prompt description */}
            <TextField
              size="small"
              fullWidth
              label="Focus / Custom Directives (optional)"
              placeholder="e.g. Focus on practical applications of inheritance and polymorphism"
              multiline
              rows={2}
              value={promptDescription}
              onChange={(e) => setPromptDescription(e.target.value)}
              sx={{ mb: 1.5 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>
            )}
          </Box>
        )}

        {/* ── Apply mode (shown when done) ── */}
        {isDone && (
          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel component="legend" sx={{ fontSize: 13, mb: 0.5 }}>
              How to apply generated questions?
            </FormLabel>
            <RadioGroup row value={applyMode} onChange={(e) => setApplyMode(e.target.value)}>
              <FormControlLabel
                value="replace"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "brand.main" } }} />}
                label={<Typography variant="body2">Replace existing questions</Typography>}
              />
              <FormControlLabel
                value="append"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "brand.main" } }} />}
                label={<Typography variant="body2">Append to existing questions</Typography>}
              />
            </RadioGroup>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {!generating && !isDone && (
          <>
            <Button onClick={handleClose} sx={{ textTransform: "none", color: "text.secondary" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              sx={{
                background: "brand.main",
                bgcolor: "brand.main",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { bgcolor: "brand.dark" },
              }}
            >
              Generate Questions
            </Button>
          </>
        )}

        {isDone && (
          <>
            <Button
              onClick={handleTryAgain}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Try Again
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleApply}
              sx={{
                background: "linear-gradient(135deg, #059669, #10B981)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { background: "linear-gradient(135deg, #047857, #059669)" },
              }}
            >
              Apply to Quiz Editor
            </Button>
          </>
        )}

        {generating && !isDone && !isError && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            Generation in progress — safe to close, result will be ready when done
          </Typography>
        )}

        {isError && (
          <>
            <Button
              onClick={handleClose}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={handleTryAgain}
              sx={{ textTransform: "none", borderColor: "brand.main", color: "brand.main" }}
            >
              Try Again
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
