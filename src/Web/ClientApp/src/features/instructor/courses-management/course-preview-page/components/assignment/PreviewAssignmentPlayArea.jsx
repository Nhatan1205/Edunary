import { useState, useRef } from "react";
import {
  Box, Typography, Button, Stack, Divider, CircularProgress, Avatar, Chip, Paper,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Feedback as FeedbackIcon,
  ListAlt as ListAltIcon,
} from "@mui/icons-material";
import TextEditor from "../../../../../../components/TextEditor";
import AlertBox from "../../../../../../components/AlertBox";

// ─── Step stepper ──────────────────────────────────────────────────────────────
const STEPS = [
  { key: "instructions", label: "Instructions" },
  { key: "submission", label: "Submission" },
  { key: "example", label: "Instructor example" },
];

function StepStepper({ currentStep, onStepClick }) {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" mb={1}>
        {STEPS.map((step, i) => (
          <Box
            key={step.key}
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: i === 0 ? "flex-start" : i === STEPS.length - 1 ? "flex-end" : "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={currentStep === step.key ? 700 : 500}
              color={currentStep === step.key ? "text.primary" : "text.secondary"}
              sx={{ cursor: "pointer", "&:hover": { color: "brand.main" }, transition: "color 0.2s" }}
              onClick={() => onStepClick(step.key)}
            >
              {step.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", height: 24 }}>
        <Box sx={{
          position: "absolute", left: 0, right: 0, top: "50%",
          transform: "translateY(-50%)", height: 3,
          bgcolor: "action.disabledBackground", borderRadius: "999px",
        }} />
        <Box sx={{
          position: "absolute", left: 0, top: "50%",
          transform: "translateY(-50%)", height: 3,
          bgcolor: "brand.main", borderRadius: "999px",
          width: currentStep === "instructions" ? "0%" : currentStep === "submission" ? "50%" : "100%",
          transition: "width 0.4s ease",
        }} />
        {STEPS.map((step, i) => {
          const isActive = step.key === currentStep;
          const isPast = currentIdx > i;
          return (
            <Box
              key={step.key}
              onClick={() => onStepClick(step.key)}
              sx={{
                position: "relative", zIndex: 1, flex: 1,
                display: "flex",
                justifyContent: i === 0 ? "flex-start" : i === STEPS.length - 1 ? "flex-end" : "center",
                cursor: "pointer",
              }}
            >
              <Box sx={{
                width: isActive ? 20 : 14, height: isActive ? 20 : 14, borderRadius: "50%",
                bgcolor: isActive || isPast ? "brand.main" : "background.paper",
                border: "3px solid",
                borderColor: isActive || isPast ? "brand.main" : "action.disabledBackground",
                transition: "all 0.3s ease",
                boxShadow: isActive ? "0 0 0 4px rgba(0,167,111,0.18)" : "none",
              }} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Panel shell ───────────────────────────────────────────────────────────────
function Panel({ children, sx }) {
  return (
    <Box sx={{
      border: "1px solid", borderColor: "divider",
      borderRadius: 2, p: 3,
      bgcolor: "background.paper",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      ...sx,
    }}>
      {children}
    </Box>
  );
}

// ─── ActiveTextEditor ──────────────────────────────────────────────────────────
function ActiveTextEditor({ value, onChange }) {
  return (
    <Box sx={{
      borderRadius: 1.5, border: "2px solid", borderColor: "divider",
      transition: "border-color 0.2s ease", overflow: "hidden",
      "&:focus-within": { borderColor: "brand.main" },
    }}>
      <TextEditor value={value} onChange={onChange} />
    </Box>
  );
}

// ─── PersonCard ────────────────────────────────────────────────────────────────
function PersonCard({ name, avatar }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
      <Avatar
        src={avatar || undefined}
        sx={{
          width: 40, height: 40, bgcolor: "brand.lighter", color: "brand.main",
          fontSize: "1rem", fontWeight: 700,
        }}
      >
        {!avatar && name?.[0]?.toUpperCase()}
      </Avatar>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {name}
      </Typography>
    </Stack>
  );
}

// ─── Previous button helper ────────────────────────────────────────────────────
function PrevButton({ onClick }) {
  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon />}
      onClick={onClick}
      sx={{
        borderRadius: "999px", px: 2, textTransform: "none", fontWeight: 600,
        color: "text.secondary",
        "&:hover": { bgcolor: "action.hover", color: "text.primary" },
      }}
    >
      Previous
    </Button>
  );
}

// ─── Instructions Step ─────────────────────────────────────────────────────────
function InstructionsStep({ assignment, onNext }) {
  const questions = assignment.questions ?? [];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>Assignment instructions</Typography>
      <Stack direction="row" alignItems="center" gap={0.75} mb={3}>
        <AccessTimeIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          {assignment.estimatedDurationMinutes} minutes to complete
        </Typography>
      </Stack>

      <Panel sx={{ mb: 4 }}>
        <Box
          dangerouslySetInnerHTML={{ __html: assignment.instructions }}
          sx={{
            lineHeight: 1.8, marginBottom: questions.length ? 3 : 0,
            "& p:first-of-type": { mt: 0 },
            "& p:last-of-type": { mb: 0 }
          }}
        />
        {questions.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
              Questions for this assignment
            </Typography>
            {questions.map((q, qi) => (
              <Stack key={q.id} direction="row" gap={1} alignItems="flex-start"
                sx={{ mb: qi < questions.length - 1 ? 1.5 : 0 }}>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>
                  {qi + 1}.
                </Typography>
                <Box dangerouslySetInnerHTML={{ __html: q.questionText }}
                  sx={{ lineHeight: 1.7, fontSize: "0.9rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
              </Stack>
            ))}
          </>
        )}
      </Panel>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained" onClick={onNext}
          sx={{
            borderRadius: "999px", px: 4, py: 1.25, fontWeight: 700,
            bgcolor: "brand.main",
            boxShadow: "0 6px 16px rgba(0,167,111,0.22)",
            "&:hover": { bgcolor: "brand.dark", transform: "translateY(-1px)", boxShadow: "0 10px 20px rgba(0,167,111,0.3)" },
            transition: "all 0.2s",
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Submission Step ───────────────────────────────────────────────────────────
// Preview: answers stored in local state. Submit = fake → go to next step.
function SubmissionStep({ assignment, answersRef, onPrev, onNext }) {
  const questions = assignment.questions ?? [];
  const [, forceRender] = useState(0);

  const handleChange = (qId, val) => {
    answersRef.current[qId] = val;
  };

  const handleSubmit = () => {
    onNext(); // fake submit — just navigate to example step
  };

  const handleSaveDraft = () => {
    // fake save draft — no-op in preview
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.5} mb={0.5} flexWrap="wrap">
        <Typography variant="h5" fontWeight={800}>Assignment submission</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3}>Save or submit your work</Typography>

      <Panel sx={{ mb: 3 }}>
        {questions.map((q, qi) => (
          <Box key={q.id} sx={{ mb: qi < questions.length - 1 ? 4 : 0 }}>
            <Stack direction="row" gap={1} alignItems="flex-start" mb={1.5}>
              <Typography variant="body1" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "2px" }}>
                {qi + 1}.
              </Typography>
              <Box dangerouslySetInnerHTML={{ __html: q.questionText }}
                sx={{ lineHeight: 1.7, fontWeight: 500, "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
            </Stack>

            <Box sx={{ ml: 3.5 }}>
              <ActiveTextEditor
                value={answersRef.current[q.id] ?? ""}
                onChange={val => handleChange(q.id, val)}
              />
            </Box>
          </Box>
        ))}
      </Panel>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <PrevButton onClick={onPrev} />
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={{
              borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 600,
              borderColor: "brand.main", color: "brand.main",
              "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 700,
              bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
            }}
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Instructor Example Step ───────────────────────────────────────────────────
function InstructorExampleStep({ assignment, answersRef, onPrev }) {
  const questions = assignment.questions ?? [];
  const studentAnswers = answersRef.current;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>How did you do?</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Compare the instructor's example to your own
      </Typography>

      <AlertBox severity="success" sx={{ mb: 3 }}>
        <Typography fontWeight={600}>Congratulations on completing this assignment!</Typography>
        Compare your answers with the instructor's example below.
      </AlertBox>

      {/* Instructor example panel */}
      <Panel sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          Instructor example
        </Typography>
        <PersonCard
          name={assignment.instructorName || "Instructor"}
          avatar={assignment.instructorAvatar || null}
        />

        {questions.map((q, qi) => (
          <Box key={q.id} sx={{ mb: qi < questions.length - 1 ? 3 : 0 }}>
            <Stack direction="row" gap={1} alignItems="flex-start" mb={0.75}>
              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>{qi + 1}.</Typography>
              <Box dangerouslySetInnerHTML={{ __html: q.questionText }}
                sx={{ lineHeight: 1.7, fontWeight: 500, fontSize: "0.925rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
            </Stack>
            {q.exampleAnswer && (
              <Box sx={{ ml: 3.5 }}>
                <Box dangerouslySetInnerHTML={{ __html: q.exampleAnswer }}
                  sx={{ lineHeight: 1.7, fontSize: "0.9rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
              </Box>
            )}
          </Box>
        ))}
      </Panel>

      {/* Student submission panel */}
      <Panel sx={{ mb: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          Your submission
        </Typography>
        <PersonCard name="Student" avatar={null} />

        {questions.map((q, qi) => {
          const ans = studentAnswers[q.id];
          if (!ans) return null;
          return (
            <Box key={q.id} sx={{ mb: qi < questions.length - 1 ? 3 : 0 }}>
              <Stack direction="row" gap={1} alignItems="flex-start" mb={0.75}>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>{qi + 1}.</Typography>
                <Box dangerouslySetInnerHTML={{ __html: q.questionText }}
                  sx={{ lineHeight: 1.7, fontWeight: 500, fontSize: "0.925rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
              </Stack>
              <Box sx={{ ml: 3.5 }}>
                <Box dangerouslySetInnerHTML={{ __html: ans }}
                  sx={{ lineHeight: 1.7, fontSize: "0.9rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
              </Box>
            </Box>
          );
        })}

        {Object.keys(studentAnswers).length === 0 && (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">No answers saved yet.</Typography>
        )}
      </Panel>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <PrevButton onClick={onPrev} />
        <Box />
      </Stack>
    </Box>
  );
}

// ─── Submission Summary Step (fake — preview, shows answers from state) ─────────
function SubmissionSummaryStep({ assignment, answersRef, onBack }) {
  const questions = assignment.questions ?? [];
  const studentAnswers = answersRef.current;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
        <ListAltIcon sx={{ color: "brand.main", fontSize: "1.5rem" }} />
        <Typography variant="h5" fontWeight={800}>Submission Summary</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Your answers and instructor feedback for this assignment.
      </Typography>

      {/* Q&A panel */}
      <Panel sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          Your answers
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ mb: -2 }}>
            <PersonCard name="Student" avatar={null} />
          </Box>
          <Typography variant="caption" color="text.secondary">just now</Typography>
        </Stack>

        {questions.map((q, qi) => {
          const ans = studentAnswers[q.id];
          return (
            <Box key={q.id} sx={{ mb: qi < questions.length - 1 ? 3 : 0 }}>
              <Stack direction="row" gap={1} alignItems="flex-start" mb={0.75}>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>
                  {qi + 1}.
                </Typography>
                <Box
                  dangerouslySetInnerHTML={{ __html: q.questionText }}
                  sx={{ lineHeight: 1.7, fontWeight: 500, fontSize: "0.925rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }}
                />
              </Stack>
              <Box sx={{ ml: 3.5 }}>
                {ans
                  ? <Box dangerouslySetInnerHTML={{ __html: ans }}
                    sx={{ lineHeight: 1.7, "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
                  : <Typography variant="body2" color="text.disabled" fontStyle="italic">No answer provided.</Typography>
                }
              </Box>
            </Box>
          );
        })}

        {questions.length === 0 && (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">No questions found.</Typography>
        )}
      </Panel>

      {/* Feedback — preview placeholder */}
      <AlertBox severity="info" sx={{ mb: 3 }}>
        <Typography fontWeight={600} mb={0.5}>No feedback yet.</Typography>
        Your instructor hasn't left any feedback on this submission yet.
      </AlertBox>

      {/* Back button */}
      <Stack direction="row" justifyContent="flex-start">
        <PrevButton onClick={onBack} />
      </Stack>
    </Box>
  );
}

// ─── Idle landing ──────────────────────────────────────────────────────────────
function IdleLanding({ assignment, onStart, onGoToSummary }) {
  return (
    <Box sx={{
      width: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 400, position: "relative", overflow: "hidden",
    }}>
      <Box sx={{
        position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,167,111,0.08) 0%, rgba(0,167,111,0) 70%)",
      }} />
      <Box sx={{
        position: "absolute", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,167,111,0.06) 0%, rgba(0,167,111,0) 70%)",
      }} />

      <Box sx={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 540 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: 4,
          bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "center",
          mb: 3, boxShadow: "0 8px 24px rgba(0,167,111,0.12)", transform: "rotate(-5deg)",
        }}>
          <AssignmentTurnedInIcon sx={{ fontSize: 36, color: "brand.main", transform: "rotate(5deg)" }} />
        </Box>

        <Typography variant="h4" fontWeight={800} mb={1} textAlign="center">
          {assignment.title}
        </Typography>

        <Stack direction="row" alignItems="center" gap={0.75} mb={2}>
          <AccessTimeIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {assignment.estimatedDurationMinutes} minutes to complete
          </Typography>
        </Stack>

        {assignment.description && (
          <Typography color="text.secondary" mb={4}
            sx={{ fontSize: "0.95rem", lineHeight: 1.75, textAlign: "justify" }}>
            {assignment.description}
          </Typography>
        )}

        <Stack direction="column" alignItems="center" gap={1.5} width="100%">
          <Button
            variant="contained" size="large" onClick={onStart}
            sx={{
              borderRadius: "999px", px: 6, py: 1.5, fontWeight: 700, fontSize: 16,
              bgcolor: "brand.main",
              "&:hover": { bgcolor: "brand.dark" },
            }}
          >
            Start Assignment
          </Button>

          {/* Always show Go to Summary in preview */}
          <Button
            variant="outlined" size="medium" onClick={onGoToSummary}
            startIcon={<ListAltIcon />}
            sx={{
              borderRadius: "999px", px: 4, py: 1, fontWeight: 600,
              borderColor: "brand.main", color: "brand.main",
              "&:hover": { bgcolor: "brand.lighter", borderColor: "brand.dark" },
              transition: "all 0.2s",
            }}
          >
            Go to Summary
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Main PreviewAssignmentPlayArea ───────────────────────────────────────────
function PreviewAssignmentPlayArea({ assignment }) {
  const [step, setStep] = useState("idle");
  // Shared answers ref across Submission ↔ Example ↔ Summary steps
  const answersRef = useRef({});

  return (
    <Box sx={{ width: "100%", height: { xs: "auto", md: "500px" }, overflowY: "auto", bgcolor: "background.default", position: "relative" }}>
      <Box sx={{ p: { xs: 3, sm: 5 }, maxWidth: 860, mx: "auto" }}>
        {step === "idle" ? (
          <IdleLanding
            assignment={assignment}
            onStart={() => setStep("instructions")}
            onGoToSummary={() => setStep("summary")}
          />
        ) : step === "summary" ? (
          <SubmissionSummaryStep
            assignment={assignment}
            answersRef={answersRef}
            onBack={() => setStep("idle")}
          />
        ) : (
          <>
            <StepStepper currentStep={step} onStepClick={setStep} />
            <Divider sx={{ mb: 4 }} />
            {step === "instructions" && (
              <InstructionsStep assignment={assignment} onNext={() => setStep("submission")} />
            )}
            {step === "submission" && (
              <SubmissionStep
                assignment={assignment}
                answersRef={answersRef}
                onPrev={() => setStep("instructions")}
                onNext={() => setStep("example")}
              />
            )}
            {step === "example" && (
              <InstructorExampleStep
                assignment={assignment}
                answersRef={answersRef}
                onPrev={() => setStep("submission")}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default PreviewAssignmentPlayArea;
