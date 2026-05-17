import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Button, Typography, TextField, Divider, Stack,
  CircularProgress, IconButton, Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PublishedWithChanges as PublishedWithChangesIcon,
} from "@mui/icons-material";
import TextEditor from "../../../../../../components/TextEditor";
import AlertBox from "../../../../../../components/AlertBox";
import ConfirmDialog from "../../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useCreateAssignment from "../../../../../../hooks/assignment-hooks/useCreateAssignment";
import useUpdateAssignment from "../../../../../../hooks/assignment-hooks/useUpdateAssignment";
import useUpdateAssignmentQuestions from "../../../../../../hooks/assignment-hooks/useUpdateAssignmentQuestions";
import useGetAssignmentByItemId from "../../../../../../hooks/assignment-hooks/useGetAssignmentByItemId";
import usePublishAssignment from "../../../../../../hooks/assignment-hooks/usePublishAssignment";

const QUESTION_BUTTONS = ["bold", "italic"];
const stripHtml = (html) => html?.replace(/<[^>]*>/g, "").trim() ?? "";

function AssignmentEditor({ item, onUpdate, courseId }) {
  const { data: existingAssignment } = useGetAssignmentByItemId(courseId, item.itemId);
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const updateQuestions = useUpdateAssignmentQuestions();
  const publishMutation = usePublishAssignment();

  const initializedRef = useRef(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);
  const [questionErrors, setQuestionErrors] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Confirm dialog for question delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const isPublished = existingAssignment?.isPublished ?? false;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: "",
      instructions: "",
      estimatedDurationMinutes: 30,
    },
  });

  // Populate form once — same pattern as QuizEditor, runs only once via initializedRef
  useEffect(() => {
    if (existingAssignment && !initializedRef.current) {
      initializedRef.current = true;
      reset({
        description: existingAssignment.description ?? "",
        instructions: existingAssignment.instructions ?? "",
        estimatedDurationMinutes: existingAssignment.estimatedDurationMinutes ?? 30,
      });
      setQuestions(
        existingAssignment.questions?.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          exampleAnswer: q.exampleAnswer,
          sortOrder: q.sortOrder,
        })) ?? []
      );
    }
  }, [existingAssignment, reset]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", exampleAnswer: "", sortOrder: questions.length },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
    if (questionErrors[index]?.[field]) {
      setQuestionErrors((prev) => {
        const next = { ...prev };
        if (next[index]) delete next[index][field];
        return next;
      });
    }
  };

  const requestDeleteQuestion = (index) => {
    setPendingDeleteIndex(index);
    setConfirmOpen(true);
  };

  const confirmDeleteQuestion = () => {
    setQuestions((prev) => prev.filter((_, i) => i !== pendingDeleteIndex));
    setQuestionErrors((prev) => {
      const next = { ...prev };
      delete next[pendingDeleteIndex];
      return next;
    });
    setConfirmOpen(false);
    setPendingDeleteIndex(null);
  };

  const cancelDeleteQuestion = () => {
    setConfirmOpen(false);
    setPendingDeleteIndex(null);
  };

  // Only validate questionText — exampleAnswer is optional
  const validateQuestions = () => {
    const errs = {};
    questions.forEach((q, i) => {
      if (!stripHtml(q.questionText)) {
        errs[i] = { questionText: "Question text is required." };
      }
    });
    setQuestionErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (formData) => {
    if (!validateQuestions()) return;

    setSaving(true);
    setSavedMsg(null);
    try {
      let assignmentId = existingAssignment?.id;

      const settingsPayload = {
        courseId,
        itemId: item.itemId,
        title: item.title,
        description: formData.description,
        instructions: formData.instructions,
        estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes),
      };

      if (!assignmentId) {
        const res = await createAssignment.mutateAsync(settingsPayload);
        assignmentId = res?.result;
        onUpdate(item.itemId, { assignmentId, description: formData.description });
      }
      else {
        await updateAssignment.mutateAsync({ assignmentId, ...settingsPayload });
        onUpdate(item.itemId, { assignmentId, description: formData.description });
      }

      await updateQuestions.mutateAsync({
        assignmentId,
        questions: questions.map((q, qi) => ({
          id: q.id,
          questionText: q.questionText,
          exampleAnswer: q.exampleAnswer,
          sortOrder: qi,
        })),
      });

      setSavedMsg("Assignment saved successfully.");
    }
    catch (e) {
      setSavedMsg(`Error: ${parseError(e)}`);
    }
    finally {
      setSaving(false);
    }
  };

  const handlePublish = async () =>
  {
    const assignmentId = existingAssignment?.id;
    if (!assignmentId) return;

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);
    try
    {
      await publishMutation.mutateAsync({
        assignmentId,
        isPublished: true,
        courseId,
        itemId: item.itemId,
      });
      setPublishSuccess(true);
    }
    catch (e)
    {
      setPublishError(parseError(e));
    }
    finally
    {
      setPublishing(false);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          pt: 2,
          pb: 1,
          "& .MuiOutlinedInput-root": {
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "brand.main" },
        }}
      >
        {/* Header row with publish status */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            Assignment Settings
          </Typography>
        </Stack>

        {/* Description */}
        <Typography
          variant="caption"
          fontWeight={600}
          color={errors.description ? "error" : "text.secondary"}
          sx={{ mb: 0.5, display: "block" }}
        >
          Description *
        </Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 0.5 }}
          {...register("description", {
            validate: (v) => v?.trim().length > 0 || "Description is required.",
          })}
          error={!!errors.description}
        />
        {errors.description && (
          <AlertBox severity="error" sx={{ mb: 1.5 }}>
            {errors.description.message}
          </AlertBox>
        )}

        {/* Instructions — WYSIWYG */}
        <Typography
          variant="caption"
          fontWeight={600}
          color={errors.instructions ? "error" : "text.secondary"}
          sx={{ mb: 0.5, display: "block", mt: 1.5 }}
        >
          Instructions *
        </Typography>
        <Controller
          name="instructions"
          control={control}
          rules={{
            validate: (v) =>
              stripHtml(v).length > 0 || "Instructions are required.",
          }}
          render={({ field }) => (
            <TextEditor
              value={field.value}
              onChange={(val) => field.onChange(val)}
            />
          )}
        />
        {errors.instructions && (
          <AlertBox severity="error" sx={{ mb: 1.5 }}>
            {errors.instructions.message}
          </AlertBox>
        )}

        {/* Estimated Duration */}
        <Typography
          variant="caption"
          fontWeight={600}
          color={errors.estimatedDurationMinutes ? "error" : "text.secondary"}
          sx={{ mb: 0.5, display: "block", mt: 1.5 }}
        >
          Estimated Duration (minutes) *
        </Typography>
        <TextField
          size="small"
          type="number"
          sx={{ mb: 0.5, width: 280 }}
          {...register("estimatedDurationMinutes", {
            required: "A minimum duration of 1 minute is required.",
            validate: (v) =>
              parseInt(v) >= 1 || "A minimum duration of 1 minute is required.",
          })}
          error={!!errors.estimatedDurationMinutes}
          onWheel={(e) => e.target.blur()}
        />
        {errors.estimatedDurationMinutes && (
          <AlertBox severity="error" sx={{ mb: 1.5 }}>
            {errors.estimatedDurationMinutes.message}
          </AlertBox>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Questions section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            Questions ({questions.length})
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            type="button"
            sx={{
              textTransform: "none",
              borderColor: "brand.main",
              color: "brand.main",
              "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
            }}
          >
            Add Question
          </Button>
        </Stack>

        {questions.map((q, qi) => (
          <QuestionEditor
            key={qi}
            question={q}
            index={qi}
            errors={questionErrors[qi] ?? {}}
            onUpdate={(field, value) => updateQuestion(qi, field, value)}
            onDelete={() => requestDeleteQuestion(qi)}
          />
        ))}

        {questions.length === 0 && (
          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              py: 3,
              textAlign: "center",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No questions yet. Add your first question above.
            </Typography>
          </Box>
        )}

        {savedMsg && (
          <AlertBox severity={savedMsg.startsWith("Error") ? "error" : "success"} sx={{ mb: 1.5 }}>
            {savedMsg}
          </AlertBox>
        )}

        {publishError && (
          <AlertBox severity="error" sx={{ mb: 1.5 }}>
            {publishError}
          </AlertBox>
        )}
        {publishSuccess && (
          <AlertBox severity="success" sx={{ mb: 1.5 }}>
            Assignment published successfully.
          </AlertBox>
        )}

        {/* Action buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} mt={1}>
          {/* Publish button — only when assignment saved and not yet published */}
          {existingAssignment?.id && !isPublished && (
            <Button
              variant="outlined"
              type="button"
              startIcon={publishing ? <CircularProgress size={16} /> : <PublishedWithChangesIcon />}
              disabled={publishing}
              onClick={handlePublish}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "success.main",
                color: "success.main",
                "&:hover": { borderColor: "success.dark", bgcolor: "success.lighter" },
              }}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          )}

          <Button
            variant="contained"
            type="submit"
            startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
            disabled={saving}
            sx={{
              bgcolor: "brand.main",
              "&:hover": { bgcolor: "brand.dark" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {saving ? "Saving..." : "Save Assignment"}
          </Button>
        </Stack>
      </Box>

      {/* Confirm delete question dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Question"
        message={`Are you sure you want to delete Question ${(pendingDeleteIndex ?? 0) + 1}? This cannot be undone.`}
        onClose={cancelDeleteQuestion}
        onConfirm={confirmDeleteQuestion}
      />
    </>
  );
}

// ─── Question sub-component ─────────────────────────────────────────────────────
function QuestionEditor({ question, index, errors, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: errors.questionText ? "error.main" : "divider",
        borderRadius: 1,
        mb: 1.5,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          bgcolor: "background.alt",
          gap: 1,
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ flex: 1, color: "text.secondary" }}>
          Question {index + 1}
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: "text.secondary" }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
        <IconButton size="small" onClick={onDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      {expanded && (
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Question text — bold/italic only, required */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color={errors.questionText ? "error" : "text.secondary"}
              sx={{ mb: 0.5, display: "block" }}
            >
              Question *
            </Typography>
            <TextEditor
              value={question.questionText}
              onChange={(val) => onUpdate("questionText", val)}
              buttons={QUESTION_BUTTONS}
            />
            {errors.questionText && (
              <AlertBox severity="error">{errors.questionText}</AlertBox>
            )}
          </Box>

          {/* Example answer — optional */}
          <Box>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 0.5, display: "block", mt: 1.5 }}
            >
              Example / Model Answer
            </Typography>
            <TextEditor
              value={question.exampleAnswer}
              onChange={(val) => onUpdate("exampleAnswer", val)}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Error parser util ────────────────────────────────────────────────────────
function parseError(e) {
  if (e.response) {
    try {
      const problem = JSON.parse(e.response);
      if (problem.errors) return Object.values(problem.errors).flat().join(" | ");
      if (problem.detail) return problem.detail;
      if (problem.title) return problem.title;
    }
    catch (_) { }
  }
  return e.message;
}

export default AssignmentEditor;
