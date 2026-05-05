import { Box, IconButton, TextField, Radio, Checkbox, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function ChoiceEditor({ choice, onUpdate, onDelete, inputType = "checkbox", isTextReadonly = false, hideDelete = false }) {
  const ControlComponent = inputType === "radio" ? Radio : Checkbox;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Tooltip title="Mark as correct answer" placement="left">
        <ControlComponent
          checked={choice.isCorrect}
          onChange={(e) => onUpdate({ ...choice, isCorrect: e.target.checked })}
          size="small"
          color="success"
          sx={{ p: 0.5 }}
        />
      </Tooltip>
      <TextField
        size="small"
        fullWidth
        placeholder="Choice text"
        value={choice.text}
        onChange={(e) => onUpdate({ ...choice, text: e.target.value })}
        disabled={isTextReadonly}
        sx={{
          "& .MuiInputBase-input": { py: 0.75 },
          "& .Mui-disabled": { WebkitTextFillColor: "text.primary" }, // Keep text dark when disabled for TrueFalse
        }}
      />
      {!hideDelete && (
        <IconButton size="small" onClick={onDelete} sx={{ color: "error.main" }} title="Remove choice">
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      {hideDelete && <Box sx={{ width: 26 }} />} {/* Placeholder to maintain alignment */}
    </Box>
  );
}

export default ChoiceEditor;
