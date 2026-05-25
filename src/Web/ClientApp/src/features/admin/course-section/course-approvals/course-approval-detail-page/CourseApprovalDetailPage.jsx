import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Box, Typography, Button, Chip, Divider,
  Card, Tab, Tabs, CircularProgress, Badge,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import DOMPurify from "dompurify";

import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useGetCoursePreviewForAdmin from "../../../../../hooks/course-review-hooks/useGetCoursePreviewForAdmin";
import useGetCourseReviewStatus from "../../../../../hooks/course-review-hooks/useGetCourseReviewStatus";
import useSaveReviewFeedback from "../../../../../hooks/course-review-hooks/useSaveReviewFeedback";
import useDeleteReviewFeedback from "../../../../../hooks/course-review-hooks/useDeleteReviewFeedback";
import useUpdateReviewFeedback from "../../../../../hooks/course-review-hooks/useUpdateReviewFeedback";
import useRequestChanges from "../../../../../hooks/course-review-hooks/useRequestChanges";
import useApproveCourse from "../../../../../hooks/course-review-hooks/useApproveCourse";

import CourseInfoCard from "./components/CourseInfoCard";
import FeedbackDrawer from "./components/FeedbackDrawer";
import TabCurriculum from "./components/TabCurriculum";
import { LEVEL_COLORS, LEVEL_LABELS, STATUS_COLORS } from "./components/courseDetailConstants";

// ── Shared mini-components (too small to extract) ─────────────────────────────

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" sx={{
      fontWeight: 700, color: "text.tertiary",
      textTransform: "uppercase", letterSpacing: "0.07em",
      display: "block", mb: 0.75,
    }}>
      {children}
    </Typography>
  );
}

function BulletList({ raw }) {
  let items = [];
  try { items = JSON.parse(raw || "[]"); } catch { items = []; }
  if (!items.length) {
    return <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>Not provided</Typography>;
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.tertiary", mt: "7px", flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.65 }}>{item}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Tab content panels ────────────────────────────────────────────────────────

function TabLandingPage({ course }) {
  if (!course) return null;
  return (
    <Box sx={{ p: 3 }}>
      <SectionLabel>Title</SectionLabel>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 2.5, lineHeight: 1.4 }}>
        {course.title || "—"}
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      <SectionLabel>Subtitle</SectionLabel>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, lineHeight: 1.7 }}>
        {course.subtitle || "—"}
      </Typography>
      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 2.5 }}>
        <Box>
          <SectionLabel>Level</SectionLabel>
          <Chip label={LEVEL_LABELS[course.level] ?? course.level} size="small"
            sx={{
              height: 22, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px",
              color: LEVEL_COLORS[course.level]?.color ?? "text.secondary",
              bgcolor: LEVEL_COLORS[course.level]?.bgcolor ?? "grey.200",
            }} />
        </Box>
        <Box>
          <SectionLabel>Category</SectionLabel>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {course.categoryTitle || "—"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <SectionLabel>Topics</SectionLabel>
          {course.topics && course.topics.length > 0 ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {course.topics.map((t) => (
                <Chip key={t.id} label={t.name} size="small" sx={{ borderRadius: "6px", fontWeight: 500 }} />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
              —
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <SectionLabel>Description</SectionLabel>
      <Typography variant="body2" component="div"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description || "<em>Not provided</em>") }}
        sx={{
          color: "text.secondary", lineHeight: 1.8,
          "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2.5, mt: 0 }, "& li": { mb: 0.5 },
        }} />


    </Box>
  );
}

function TabPricing({ course }) {
  if (!course) return null;
  return (
    <Box sx={{ p: 3 }}>
      <SectionLabel>Course Price</SectionLabel>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
          ${course.price?.toFixed(2) ?? "—"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.tertiary" }}>USD</Typography>
      </Box>
    </Box>
  );
}

function TabIntendedLearners({ course }) {
  if (!course) return null;
  return (
    <Box sx={{ p: 3 }}>
      <SectionLabel>What students will learn</SectionLabel>
      <Box sx={{ mb: 3 }}><BulletList raw={course.learningObjectives} /></Box>

      <Divider sx={{ mb: 3 }} />

      <SectionLabel>Requirements</SectionLabel>
      <Box sx={{ mb: 3 }}><BulletList raw={course.requirements} /></Box>

      <Divider sx={{ mb: 3 }} />

      <SectionLabel>Target Audience</SectionLabel>
      <BulletList raw={course.targetAudience} />
    </Box>
  );
}

function TabCourseMessages({ course }) {
  if (!course) return null;
  return (
    <Box sx={{ p: 3 }}>
      <SectionLabel>Welcome Message</SectionLabel>
      <Typography variant="body2" component="div"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.welcomeMessage || "<em>Not provided</em>") }}
        sx={{
          color: "text.secondary", lineHeight: 1.8, mb: 3,
          "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2.5, mt: 0 }, "& li": { mb: 0.5 },
        }} />

      <Divider sx={{ mb: 3 }} />

      <SectionLabel>Congratulations Message</SectionLabel>
      <Typography variant="body2" component="div"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.congratulationsMessage || "<em>Not provided</em>") }}
        sx={{
          color: "text.secondary", lineHeight: 1.8,
          "& p": { mt: 0, mb: 1 }, "& ul": { pl: 2.5, mt: 0 }, "& li": { mb: 0.5 },
        }} />
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CourseApprovalDetailPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const { data: previewData, isLoading } = useGetCoursePreviewForAdmin(submissionId);

  const saveFeedbackMutation = useSaveReviewFeedback(submissionId);
  const deleteFeedbackMutation = useDeleteReviewFeedback(submissionId);
  const updateFeedbackMutation = useUpdateReviewFeedback(submissionId);
  const requestChangesMutation = useRequestChanges(submissionId);
  const approveMutation = useApproveCourse(submissionId);

  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const course = previewData?.course ?? {};
  const feedbacks = previewData?.currentFeedbacks ?? [];
  const submissionInfo = previewData?.submissionInfo;
  const curriculumSections = previewData?.curriculumSections ?? [];

  const { data: reviewStatusData } = useGetCourseReviewStatus(course?.id);
  const submissionHistory = reviewStatusData?.submissionHistory ?? [];

  const requiredUnresolved = feedbacks.filter((f) => f.feedbackType === 0).length;
  const statusCfg = STATUS_COLORS[submissionInfo?.status] ?? STATUS_COLORS[0];

  const handleApprove = useCallback(() => {
    if (!submissionInfo?.submissionId) return;
    approveMutation.mutate(submissionInfo.submissionId, {
      onSuccess: () => {
        setApproveDialogOpen(false);
        navigate("/admin/course/approvals");
      },
    });
  }, [approveMutation, submissionInfo, navigate]);

  // Broadcast curriculum data to admin preview tab
  useEffect(() => {
    if (!curriculumSections.length || !course?.id) return;
    const channel = new BroadcastChannel(`preview_channel_${course.id}`);
    channel.onmessage = (event) => {
      if (event.data.type === "REQUEST_DATA") {
        channel.postMessage({ type: "SEND_DATA", payload: curriculumSections });
      }
    };
    return () => channel.close();
  }, [curriculumSections, course?.id]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/course/approvals")}
            size="small"
            sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600, pl: 0, "&:hover": { bgcolor: "transparent", color: "text.primary" } }}>
            Course Approvals
          </Button>
          <Typography variant="caption" sx={{ color: "text.tertiary" }}>/</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
            Review Submission
          </Typography>
          {statusCfg && (
            <Chip label={statusCfg.label} color={statusCfg.color} size="small"
              sx={{ fontWeight: 700, borderRadius: "8px", fontSize: "0.75rem", height: 22 }} />
          )}
          <Typography variant="caption" sx={{ color: "text.tertiary" }}>
            #{submissionInfo?.submissionNumber ?? "—"}
          </Typography>
        </Box>

        <Button variant="contained" id="open-feedback-drawer-btn"
          startIcon={<FeedbackOutlinedIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            textTransform: "none", fontWeight: 700, borderRadius: "10px", bgcolor: "brand.main",
            boxShadow: "none", "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
            display: "flex", alignItems: "center", gap: 1
          }}>
          Feedback &amp; Actions
          {feedbacks.length > 0 && (
            <Box
              sx={{
                px: 0.85,
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                lineHeight: "18px",
                bgcolor: requiredUnresolved > 0 ? "error.main" : "success.main",
                color: "#fff",
              }}
            >
              {feedbacks.length}
            </Box>
          )}
        </Button>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* Left: sticky course card */}
        <Box sx={{ width: 300, flexShrink: 0, position: "sticky", top: 16 }}>
          <CourseInfoCard
            course={course}
            submissionInfo={submissionInfo}
            submissionId={submissionId}
            courseId={course?.id}
          />
        </Box>

        {/* Right: tabbed detail */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden" }}>
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{ px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.875rem", minWidth: "auto", px: 2 } }}>
                <Tab label="Landing Page" id="tab-landing" />
                <Tab label="Pricing" id="tab-pricing" />
                <Tab label="Intended Learners" id="tab-learners" />
                <Tab label="Course Messages" id="tab-messages" />
                <Tab label="Curriculum" id="tab-curriculum" />
              </Tabs>
            </Box>

            {tab === 0 && <TabLandingPage course={course} />}
            {tab === 1 && <TabPricing course={course} />}
            {tab === 2 && <TabIntendedLearners course={course} />}
            {tab === 3 && <TabCourseMessages course={course} />}
            {tab === 4 && <TabCurriculum sections={curriculumSections} />}
          </Card>
        </Box>
      </Box>

      {/* ── Feedback Drawer ── */}
      <FeedbackDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        feedbacks={feedbacks}
        submissionInfo={submissionInfo}
        courseId={course?.id}
        submissionHistory={submissionHistory}
        saveMutation={saveFeedbackMutation}
        deleteMutation={deleteFeedbackMutation}
        updateMutation={updateFeedbackMutation}
        requestChangesMutation={requestChangesMutation}
        approveMutation={approveMutation}
        onApproveClick={() => setApproveDialogOpen(true)}
      />

      {/* ── Approve confirm dialog ── */}
      <ConfirmDialog
        open={approveDialogOpen}
        title="Approve & Publish"
        message="Are you sure you want to approve this course and publish it to the marketplace? This action will notify the instructor."
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApprove}
      />
    </Box>
  );
}
