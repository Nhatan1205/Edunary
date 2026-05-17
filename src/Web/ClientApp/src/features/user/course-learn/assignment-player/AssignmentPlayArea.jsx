import { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Stack, Divider, CircularProgress, Avatar, Chip,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TextEditor from "../../../../components/TextEditor";
import AlertBox from "../../../../components/AlertBox";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useGetAssignmentDraft from "../../../../hooks/assignment-submission-hooks/useGetAssignmentDraft";
import useUpsertAssignmentSubmission from "../../../../hooks/assignment-submission-hooks/useUpsertAssignmentSubmission";
import useGetStudentSubmission from "../../../../hooks/assignment-submission-hooks/useGetStudentSubmission";
import useGetBasicUserInfo from "../../../../hooks/auth-hooks/useGetBasicUserInfor";
import { ASSIGNMENT_STATUS } from "../../../../utils/helpers";

// ─── Step stepper ─────────────────────────────────────────────────────────────
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

// ─── Panel shell ──────────────────────────────────────────────────────────────
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

// ─── ActiveTextEditor — :focus-within border, no state ───────────────────────
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

// ─── PersonCard ───────────────────────────────────────────────────────────────
function PersonCard({ name, avatar, userId }) {
  const navigate = useNavigate();
  const clickable = !!userId;
  return (
    <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
      <Avatar
        src={avatar || undefined}
        sx={{
          width: 40, height: 40, bgcolor: "brand.lighter", color: "brand.main",
          fontSize: "1rem", fontWeight: 700,
          cursor: clickable ? "pointer" : "default",
        }}
        onClick={clickable ? () => navigate(`/profile/${userId}`) : undefined}
      >
        {!avatar && name?.[0]?.toUpperCase()}
      </Avatar>
      <Typography
        variant="body2" fontWeight={600}
        color={clickable ? "brand.main" : "text.primary"}
        sx={{ cursor: clickable ? "pointer" : "default", "&:hover": clickable ? { textDecoration: "underline" } : {} }}
        onClick={clickable ? () => navigate(`/profile/${userId}`) : undefined}
      >
        {name}
      </Typography>
    </Stack>
  );
}

// ─── Previous button helper ───────────────────────────────────────────────────
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

// ─── Instructions Step ────────────────────────────────────────────────────────
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

// ─── Submission Step ──────────────────────────────────────────────────────────
function SubmissionStep({ assignment, onPrev, onNext }) {
  const questions = assignment.questions ?? [];
  const isSubmitted = assignment.submissionStatus === ASSIGNMENT_STATUS.SUBMITTED;
  const submissionId = assignment.submissionId;

  const { data: draft } = useGetAssignmentDraft(assignment.id);
  const { data: submissionData } = useGetStudentSubmission(isSubmitted ? submissionId : null);
  const upsertMutation = useUpsertAssignmentSubmission();

  const answersRef = useRef({});
  const [initialized, setInitialized] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (initialized) return;
    if (isSubmitted && submissionData?.answers) {
      const prefilled = {};
      submissionData.answers.forEach(a => { prefilled[a.questionId] = a.studentAnswer; });
      answersRef.current = prefilled;
      setInitialized(true);
    } else if (!isSubmitted && draft !== undefined) {
      if (draft?.answers) answersRef.current = { ...draft.answers };
      setInitialized(true);
    }
  }, [draft, submissionData, isSubmitted, initialized]);

  const buildPayload = () =>
    questions.map(q => ({ questionId: q.id, answerText: answersRef.current[q.id] ?? "" }));

  const handleSaveDraft = async () => {
    setActionMsg(null); setActionError(null);
    try {
      await upsertMutation.mutateAsync({ assignmentId: assignment.id, answers: buildPayload(), action: "draft" });
      setActionMsg("Draft saved.");
    } catch (e) { setActionError(e.message ?? "Failed to save draft."); }
  };

  const handleSubmit = async () => {
    setConfirmOpen(false); setActionMsg(null); setActionError(null);
    try {
      await upsertMutation.mutateAsync({ assignmentId: assignment.id, answers: buildPayload(), action: "submit" });
      setActionMsg("Assignment submitted successfully!");
      onNext();
    } catch (e) { setActionError(e.message ?? "Failed to submit."); }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.5} mb={0.5} flexWrap="wrap">
        <Typography variant="h5" fontWeight={800}>Assignment submission</Typography>
        {isSubmitted && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "1rem !important" }} />}
            label="Assignment submitted" size="small" color="success" variant="outlined"
          />
        )}
      </Stack>
      {!isSubmitted && (
        <Typography variant="body2" color="text.secondary" mb={3}>Save or submit your work</Typography>
      )}

      <Panel sx={{ mb: 3 }}>
        {!initialized ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress size={28} /></Box>
        ) : (
          questions.map((q, qi) => (
            <Box key={q.id} sx={{ mb: qi < questions.length - 1 ? 4 : 0 }}>
              <Stack direction="row" gap={1} alignItems="flex-start" mb={1.5}>
                <Typography variant="body1" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "2px" }}>
                  {qi + 1}.
                </Typography>
                <Box dangerouslySetInnerHTML={{ __html: q.questionText }}
                  sx={{ lineHeight: 1.7, fontWeight: 500, "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
              </Stack>

              {isSubmitted ? (
                <Box sx={{ ml: 3.5, p: 2, bgcolor: "background.alt", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
                  {answersRef.current[q.id]
                    ? <Box dangerouslySetInnerHTML={{ __html: answersRef.current[q.id] }} sx={{ lineHeight: 1.7, "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
                    : <Typography variant="body2" color="text.disabled" fontStyle="italic">No answer provided.</Typography>
                  }
                </Box>
              ) : (
                <Box sx={{ ml: 3.5 }}>
                  <ActiveTextEditor
                    value={answersRef.current[q.id] ?? ""}
                    onChange={val => { answersRef.current[q.id] = val; }}
                  />
                </Box>
              )}
            </Box>
          ))
        )}
      </Panel>

      {actionMsg && <AlertBox severity="success" sx={{ mb: 1.5 }}>{actionMsg}</AlertBox>}
      {actionError && <AlertBox severity="error" sx={{ mb: 1.5 }}>{actionError}</AlertBox>}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <PrevButton onClick={onPrev} />

        {!isSubmitted ? (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined" onClick={handleSaveDraft}
              disabled={upsertMutation.isPending}
              sx={{
                borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 600,
                borderColor: "brand.main", color: "brand.main",
                "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
              }}
            >
              {upsertMutation.isPending ? <CircularProgress size={18} /> : "Save Draft"}
            </Button>
            <Button
              variant="contained" onClick={() => setConfirmOpen(true)}
              disabled={upsertMutation.isPending}
              sx={{
                borderRadius: "999px", px: 3, textTransform: "none", fontWeight: 700,
                bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
              }}
            >
              {upsertMutation.isPending ? <CircularProgress size={18} color="inherit" /> : "Submit"}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained" onClick={onNext}
            sx={{
              borderRadius: "999px", px: 4, py: 1.25, fontWeight: 700,
              bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
            }}
          >
            View Instructor Example
          </Button>
        )}
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit Assignment"
        message="You will no longer be able to edit after you submit."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
    </Box>
  );
}

// ─── Instructor Example Step ──────────────────────────────────────────────────
function InstructorExampleStep({ assignment, onPrev }) {
  const isSubmitted = assignment.submissionStatus === ASSIGNMENT_STATUS.SUBMITTED;
  const submissionId = assignment.submissionId;

  const { data: draft } = useGetAssignmentDraft(assignment.id);
  const { data: submissionData, isLoading: subLoading } = useGetStudentSubmission(
    isSubmitted ? submissionId : null
  );
  const { data: currentUser } = useGetBasicUserInfo();

  const questions = assignment.questions ?? [];

  const studentAnswers = {};
  if (isSubmitted && submissionData?.answers) {
    submissionData.answers.forEach(a => { studentAnswers[a.questionId] = a.studentAnswer; });
  } else if (!isSubmitted && draft?.answers) {
    Object.assign(studentAnswers, draft.answers);
  }

  if (subLoading && isSubmitted) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={0.5}>How did you do?</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Compare the instructor's example to your own
      </Typography>

      {isSubmitted && (
        <AlertBox severity="success" sx={{ mb: 3 }}>
          <Typography fontWeight={600}>Congratulations on completing this assignment!</Typography>
          Compare your answers with the instructor's example below.
        </AlertBox>
      )}

      {/* Instructor example panel */}
      <Panel sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          Instructor example
        </Typography>
        <PersonCard
          name={assignment.instructorName || "Instructor"}
          avatar={assignment.instructorAvatar || null}
          userId={assignment.instructorId || null}
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

      {/* Student submission / draft panel */}
      <Panel sx={{ mb: isSubmitted ? 0 : 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          Your submission
        </Typography>
        <PersonCard
          name={currentUser?.fullName || "You"}
          avatar={currentUser?.avatar || null}
          userId={null}
        />

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
      {!isSubmitted && (
        <AlertBox severity="info" sx={{ mt: 3 }}>
          <Typography fontWeight={600} mb={0.5}>You haven't submitted your answer yet.</Typography>
          Go to the Submission step to submit your answer.
        </AlertBox>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={isSubmitted ? 2 : 0}>
        <PrevButton onClick={onPrev} />
        <Box />
      </Stack>


    </Box>
  );
}

// ─── Idle landing ─────────────────────────────────────────────────────────────
function IdleLanding({ assignment, onStart }) {
  const isSubmitted = assignment.submissionStatus === ASSIGNMENT_STATUS.SUBMITTED;
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

        {isSubmitted && (
          <Stack direction="row" alignItems="center" gap={1} mb={3}
            sx={{ px: 2.5, py: 1, borderRadius: "999px", bgcolor: "success.lighter", border: "1px solid", borderColor: "success.light" }}>
            <CheckCircleIcon sx={{ color: "success.main", fontSize: "1.1rem" }} />
            <Typography variant="body2" fontWeight={600} color="success.main">Submitted</Typography>
          </Stack>
        )}

        <Button
          variant="contained" size="large" onClick={onStart}
          sx={{
            borderRadius: "999px", px: 6, py: 1.5, fontWeight: 700, fontSize: 16,
            bgcolor: "brand.main",
            boxShadow: "0 8px 16px rgba(0,167,111,0.24)", transition: "all 0.2s",
            "&:hover": { bgcolor: "brand.dark", boxShadow: "0 12px 20px rgba(0,167,111,0.32)", transform: "translateY(-2px)" },
          }}
        >
          {assignment.submissionStatus == null
            ? "Start Assignment" : "View Assignment"}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
function AssignmentPlayAreaFinal({ assignment }) {
  const [step, setStep] = useState("idle");

  return (
    <Box sx={{ width: "100%", bgcolor: "background.default" }}>
      <Box sx={{ p: { xs: 3, sm: 5 }, maxWidth: 860, mx: "auto" }}>
        {step === "idle" ? (
          <IdleLanding assignment={assignment} onStart={() => setStep("instructions")} />
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
                onPrev={() => setStep("instructions")}
                onNext={() => setStep("example")}
              />
            )}
            {step === "example" && (
              <InstructorExampleStep
                assignment={assignment}
                onPrev={() => setStep("submission")}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default AssignmentPlayAreaFinal;
