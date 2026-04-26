import { useMemo, useState, useRef, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import useGetCourseNotesByVideo from "../../../../hooks/course-notes-hooks/useGetCourseNotesByVideo";
import useCreateCourseNote from "../../../../hooks/course-notes-hooks/useCreateCourseNote";
import useUpdateCourseNote from "../../../../hooks/course-notes-hooks/useUpdateCourseNote";
import useDeleteCourseNote from "../../../../hooks/course-notes-hooks/useDeleteCourseNote";

const formatTime = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

function NotesArea({ courseId, contentId, currentItem, currentTime, onSeek, onPauseVideo }) {
  const [isComposing, setIsComposing] = useState(false);
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const textFieldRef = useRef(null);

  const courseIdNumber = Number(courseId);
  const videoIdNumber = Number(currentItem?.videoId);

  const { data: notes = [], isLoading, error } = useGetCourseNotesByVideo(
    courseIdNumber,
    videoIdNumber
  );
  const createMutation = useCreateCourseNote();
  const updateMutation = useUpdateCourseNote(courseIdNumber, videoIdNumber);
  const deleteMutation = useDeleteCourseNote(courseIdNumber, videoIdNumber);

  const busy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const sortedNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) => (a.timestampSeconds || 0) - (b.timestampSeconds || 0)
    );
  }, [notes]);

  useEffect(() => {
    if (isComposing && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [isComposing]);

  const resetForm = () => {
    setContent("");
    setEditingNote(null);
    setIsComposing(false);
  };

  const handleOpenComposer = () => {
    onPauseVideo?.();
    const roundedTime = Math.round(currentTime);
    const existingNote = sortedNotes.find(
      (n) => Math.round(n.timestampSeconds || 0) === roundedTime
    );
    if (existingNote) {
      setEditingNote(existingNote);
      setContent(existingNote.content || "");
    } else {
      setEditingNote(null);
      setContent("");
    }
    setIsComposing(true);
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (editingNote) {
      await updateMutation.mutateAsync({
        noteId: editingNote.id,
        timestampSeconds: editingNote.timestampSeconds,
        content: trimmed,
      });
      resetForm();
      onSeek?.(Number(editingNote.timestampSeconds) || 0);
      return;
    }

    const savedTimestamp = currentTime;
    await createMutation.mutateAsync({
      courseId: courseIdNumber,
      videoId: videoIdNumber,
      itemId: contentId,
      timestampSeconds: savedTimestamp,
      content: trimmed,
    });

    resetForm();
    onSeek?.(Number(savedTimestamp) || 0);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setContent(note.content || "");
    setIsComposing(true);
    onPauseVideo?.();
  };

  const handleDelete = async (noteId) => {
    await deleteMutation.mutateAsync(noteId);

    if (editingNote?.id === noteId) {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} sx={{ color: "brand.main" }} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "text.primary" }}>
        My Notes
      </Typography>

      {error && <Alert severity="error">Failed to load notes.</Alert>}

      {(createMutation.error || updateMutation.error || deleteMutation.error) && (
        <Alert severity="error">Action failed. Please try again.</Alert>
      )}

      {!isComposing && (() => {
        const hasNoteAtCurrentTime = sortedNotes.some(
          (n) => Math.round(n.timestampSeconds || 0) === Math.round(currentTime)
        );
        return (
          <Button
            variant="contained"
            startIcon={hasNoteAtCurrentTime ? <EditIcon /> : <NoteAddIcon />}
            onClick={handleOpenComposer}
            disabled={!videoIdNumber}
            sx={{
              bgcolor: "brand.main",
              "&:hover": { backgroundColor: "brand.dark" },
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,
              justifyContent: "flex-start",
              textTransform: "none",
            }}
          >
            {hasNoteAtCurrentTime ? "Edit" : "Take"} note at {formatTime(currentTime)}
          </Button>
        );
      })()}

      <Collapse in={isComposing}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: "1px solid",
            borderColor: "brand.light",
            bgcolor: "background.surface",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: "1rem", color: "brand.main" }} />
              <Typography variant="body2" color="text.secondary">
                {editingNote ? "Editing note at" : "Note at"}{" "}
                <strong style={{ color: "brand.dark" }}>
                  {formatTime(editingNote ? editingNote.timestampSeconds : currentTime)}
                </strong>
              </Typography>
            </Stack>

            <IconButton
              size="small"
              onClick={resetForm}
              sx={{ color: "grey.500", "&:hover": { color: "grey.700", bgcolor: "grey.200" } }}
            >
              <CloseIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Stack>

          <TextField
            inputRef={textFieldRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minRows={3}
            multiline
            fullWidth
            placeholder="Write your note..."
            disabled={busy}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "brand.main",
                },
              },
            }}
          />

          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={editingNote ? <EditIcon /> : <AddIcon />}
              onClick={handleSubmit}
              sx={{
                bgcolor: "brand.main",
                "&:hover": { backgroundColor: "brand.dark" },
                fontWeight: 600,
              }}
              disabled={busy || !content.trim() || !videoIdNumber}
            >
              {editingNote ? "Update note" : "Save note"}
            </Button>

            <Button
              variant="outlined"
              onClick={resetForm}
              disabled={busy}
              sx={{
                borderColor: "brand.main",
                color: "brand.main",
                "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      <Box>
        {sortedNotes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No notes yet for this lecture.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {sortedNotes.map((note) => (
              <Paper
                key={note.id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.surface",
                  borderRadius: 2,
                  p: 2,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "brand.light" },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AccessTimeIcon sx={{ fontSize: "0.9rem", color: "brand.main" }} />}
                    onClick={() => onSeek?.(Number(note.timestampSeconds) || 0)}
                    sx={{
                      textTransform: "none",
                      px: 0.5,
                      minWidth: 0,
                      color: "brand.dark",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      display: "inline-flex",
                      alignItems: "center",
                      verticalAlign: "middle",
                      "& .MuiButton-startIcon": {
                        marginRight: "4px",
                        marginBottom: "1px",
                      },
                      "&:hover": { bgcolor: "brand.lighter" },
                    }}
                  >
                    {formatTime(note.timestampSeconds)}
                  </Button>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(note)}
                      disabled={busy}
                      sx={{ color: "grey.600", "&:hover": { color: "brand.main", bgcolor: "brand.lighter" } }}
                    >
                      <EditIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(note.id)}
                      disabled={busy}
                      sx={{ color: "grey.600", "&:hover": { color: "error.main", bgcolor: "error.lighter" } }}
                    >
                      <DeleteIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                  </Stack>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", mt: 0.5, color: "text.primary", lineHeight: 1.6 }}
                >
                  {note.content}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

export default NotesArea;
