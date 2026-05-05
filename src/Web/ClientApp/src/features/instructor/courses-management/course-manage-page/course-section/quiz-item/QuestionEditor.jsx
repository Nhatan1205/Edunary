import { Box, Button, IconButton, Typography, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Divider } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ChoiceEditor from "./ChoiceEditor";

function QuestionEditor({ question, index, onUpdate, onDelete }) {
  const handleTypeChange = (newType) => {
    let newChoices = [...question.choices];

    if (newType === "TrueFalse") {
      newChoices = [
        { text: "True", isCorrect: true, sortOrder: 0 },
        { text: "False", isCorrect: false, sortOrder: 1 }
      ];
    } else if (newType === "SingleChoice") {
      // Ensure only 1 correct choice if changing from MultipleChoice
      let hasCorrect = false;
      newChoices = newChoices.map(c => {
        if (c.isCorrect && !hasCorrect) {
          hasCorrect = true;
          return c;
        }
        return { ...c, isCorrect: false };
      });
      // If none was correct, make the first one correct
      if (!hasCorrect && newChoices.length > 0) {
        newChoices[0].isCorrect = true;
      }
      
      // Ensure at least 2 choices
      while (newChoices.length < 2) {
        newChoices.push({ text: `Choice ${newChoices.length + 1}`, isCorrect: false, sortOrder: newChoices.length });
      }
    } else if (newType === "MultipleChoice") {
      // Ensure at least 2 choices
      while (newChoices.length < 2) {
        newChoices.push({ text: `Choice ${newChoices.length + 1}`, isCorrect: false, sortOrder: newChoices.length });
      }
      // Ensure at least 1 correct choice
      if (!newChoices.some(c => c.isCorrect) && newChoices.length > 0) {
        newChoices[0].isCorrect = true;
      }
    }

    onUpdate({ ...question, type: newType, choices: newChoices });
  };

  const addChoice = () => {
    if (question.type === "TrueFalse") return;

    const newChoices = [
      ...question.choices,
      { text: "", isCorrect: false, sortOrder: question.choices.length },
    ];
    onUpdate({ ...question, choices: newChoices });
  };

  const updateChoice = (choiceIdx, updated) => {
    let newChoices = question.choices.map((c, i) => (i === choiceIdx ? updated : c));

    // For SingleChoice and TrueFalse, only one can be correct
    if ((question.type === "SingleChoice" || question.type === "TrueFalse") && updated.isCorrect) {
      newChoices = newChoices.map((c, i) => 
        i === choiceIdx ? c : { ...c, isCorrect: false }
      );
    }

    onUpdate({ ...question, choices: newChoices });
  };

  const deleteChoice = (choiceIdx) => {
    if (question.type === "TrueFalse" || question.choices.length <= 2) return;

    const newChoices = question.choices.filter((_, i) => i !== choiceIdx);
    
    // If we deleted the only correct choice, make the first one correct
    if ((question.type === "SingleChoice" || question.type === "MultipleChoice") && !newChoices.some(c => c.isCorrect) && newChoices.length > 0) {
      newChoices[0].isCorrect = true;
    }

    onUpdate({ ...question, choices: newChoices });
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
          Question {index + 1}
        </Typography>
        <IconButton size="small" onClick={onDelete} sx={{ color: "error.main", "&:hover": { bgcolor: "error.lighter" } }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          label="Question Title"
          value={question.name}
          onChange={(e) => onUpdate({ ...question, name: e.target.value })}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id={`type-label-${index}`}>Question Type</InputLabel>
          <Select
            labelId={`type-label-${index}`}
            value={question.type}
            label="Question Type"
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <MenuItem value="SingleChoice">Single Choice</MenuItem>
            <MenuItem value="MultipleChoice">Multiple Choice</MenuItem>
            <MenuItem value="TrueFalse">True/False</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <TextField
        size="small"
        fullWidth
        label="Explanation (optional, shown after answering)"
        value={question.explanation || ""}
        onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ mb: 2 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Answers
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {question.type === "MultipleChoice" ? "Select all correct answers" : "Select the correct answer"}
        </Typography>
      </Stack>

      {question.choices.map((c, ci) => (
        <ChoiceEditor
          key={ci}
          choice={c}
          inputType={question.type === "MultipleChoice" ? "checkbox" : "radio"}
          isTextReadonly={question.type === "TrueFalse"}
          hideDelete={question.type === "TrueFalse" || question.choices.length <= 2}
          onUpdate={(updated) => updateChoice(ci, updated)}
          onDelete={() => deleteChoice(ci)}
        />
      ))}

      {question.type !== "TrueFalse" && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addChoice}
          variant="outlined"
          sx={{ textTransform: "none", mt: 1, borderRadius: 2 }}
        >
          Add Choice
        </Button>
      )}
    </Box>
  );
}

export default QuestionEditor;
