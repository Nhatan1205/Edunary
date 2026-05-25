import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  Chip,
  Grid,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import UnpublishedIcon from "@mui/icons-material/Unpublished";

import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import useGetCourseChangesComparison from "../../../../hooks/course-review-hooks/useGetCourseChangesComparison";
import useUnpublishCourse from "../../../../hooks/course-hooks/useUnpublishCourse";
import UnpublishDialog from "../course-management/components/UnpublishDialog";

import HtmlDiffModal from "./components/HtmlDiffModal";
import QuizComparisonModal from "./components/QuizComparisonModal";
import AssignmentComparisonModal from "./components/AssignmentComparisonModal";
import LandingPageComparison from "./components/LandingPageComparison";
import IntendedLearnersComparison from "./components/IntendedLearnersComparison";
import PricingComparison from "./components/PricingComparison";
import CourseMessagesComparison from "./components/CourseMessagesComparison";
import CurriculumComparison from "./components/CurriculumComparison";

const cardSx = {
  p: 3,
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.05)",
  mb: 3,
};

export default function CourseChangesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Landing Page");
  
  // HTML Diff states
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffTarget, setDiffTarget] = useState({ field: "", oldValue: "", newValue: "" });

  // Quiz / Assignment details states
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState(null);

  // Curriculum Tree Collapsible states
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  const id = parseInt(courseId, 10);
  const { data: comparison } = useGetCourseChangesComparison(id);
  const { mutate: unpublish, isPending: unpublishPending } = useUnpublishCourse();

  const allCategories = [
    "Landing Page",
    "Intended Learners",
    "Pricing",
    "Course Messages",
    "Curriculum",
  ];

  const activeData = comparison;

  // Define variables securely
  const hasChanges = activeData?.hasChanges ?? false;
  const noSnapshot = activeData?.noSnapshot ?? false;

  // Auto-expand modified items and sections by default
  useEffect(() => {
    if (activeData?.curriculumComparison) {
      const initialSecs = {};
      const initialItems = {};
      activeData.curriculumComparison.forEach((sec) => {
        if (sec.status !== "unchanged") {
          initialSecs[sec.sectionId] = true;
        }
        sec.items?.forEach((item) => {
          const quizComp = item.type === "quiz" && activeData?.quizComparison?.find((q) => q.quizId === item.quizId);
          const assignComp = item.type === "assignment" && activeData?.assignmentComparison?.find((a) => a.assignmentId === item.assignmentId);
          const hasUnderlyingChanges = (quizComp && quizComp.status !== "unchanged") || (assignComp && assignComp.status !== "unchanged");

          if (item.status !== "unchanged" || hasUnderlyingChanges) {
            initialItems[item.itemId] = true;
            initialSecs[sec.sectionId] = true; // Auto-expand parent section
          }
        });
      });
      setExpandedSections(initialSecs);
      setExpandedItems(initialItems);
    }
  }, [activeData]);

  const handleUnpublishConfirm = (reason) => {
    unpublish(
      { courseId: id, reason },
      {
        onSuccess: () => {
          setUnpublishOpen(false);
          navigate("/admin/course/list");
        },
      }
    );
  };

  const getChangesForCategory = (category) => {
    if (category === "Landing Page") {
      const landingGroup = activeData?.changeGroups?.find((g) => g.category === "Landing Page");
      let landingChanges = landingGroup?.changes ?? [];

      if (landingChanges.length === 0) {
        const basicGroup = activeData?.changeGroups?.find((g) => g.category === "Basic Info");
        landingChanges = basicGroup?.changes?.filter((c) =>
          ["Title", "Subtitle", "Description", "Level", "Course Image", "Category"].includes(c.field)
        ) ?? [];
      }

      const topicsGroup = activeData?.changeGroups?.find((g) => g.category === "Topics");
      const topicsChanges = topicsGroup?.changes ?? [];

      return [...landingChanges, ...topicsChanges];
    }

    if (category === "Pricing") {
      const pricingGroup = activeData?.changeGroups?.find((g) => g.category === "Pricing" || g.category === "Pricing & Promotion");
      if (pricingGroup?.changes?.length > 0) {
        return pricingGroup.changes;
      }
      const basicGroup = activeData?.changeGroups?.find((g) => g.category === "Basic Info");
      return basicGroup?.changes?.filter((c) =>
        ["Price", "Allow Platform Coupons", "AllowPlatformCoupons"].includes(c.field)
      ) ?? [];
    }

    if (category === "Course Messages") {
      const msgGroup = activeData?.changeGroups?.find((g) => g.category === "Course Messages" || g.category === "Messages");
      if (msgGroup?.changes?.length > 0) {
        return msgGroup.changes;
      }
      const basicGroup = activeData?.changeGroups?.find((g) => g.category === "Basic Info");
      return basicGroup?.changes?.filter((c) =>
        ["Welcome Message", "Congratulations Message", "WelcomeMessage", "CongratulationsMessage"].includes(c.field)
      ) ?? [];
    }

    if (category === "Intended Learners") {
      const group = activeData?.changeGroups?.find((g) => g.category === "Intended Learners");
      return group?.changes ?? [];
    }

    return [];
  };

  const getChangeCountForCategory = (category) => {
    if (category === "Curriculum") {
      let count = 0;
      activeData?.curriculumComparison?.forEach((sec) => {
        if (sec.status !== "unchanged") count++;
        sec.items?.forEach((item) => {
          if (item.status !== "unchanged") count++;
        });
      });
      return count;
    }
    return getChangesForCategory(category).length;
  };

  const toggleSection = (secId) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const toggleItem = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const renderCategoryDetails = () => {
    switch (activeCategory) {
      case "Landing Page":
        return (
          <LandingPageComparison
            changes={getChangesForCategory("Landing Page")}
            onCompareClick={(field, oldValue, newValue) => {
              setDiffTarget({ field, oldValue, newValue });
              setDiffModalOpen(true);
            }}
          />
        );
      case "Intended Learners":
        return <IntendedLearnersComparison changes={getChangesForCategory("Intended Learners")} />;
      case "Pricing":
        return <PricingComparison changes={getChangesForCategory("Pricing")} />;
      case "Course Messages":
        return (
          <CourseMessagesComparison
            changes={getChangesForCategory("Course Messages")}
            onCompareClick={(field, oldValue, newValue) => {
              setDiffTarget({ field, oldValue, newValue });
              setDiffModalOpen(true);
            }}
          />
        );
      case "Curriculum":
        return (
          <CurriculumComparison
            comparisonList={activeData?.curriculumComparison ?? []}
            activeData={activeData}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            expandedItems={expandedItems}
            toggleItem={toggleItem}
            onCompareClick={(field, oldValue, newValue) => {
              setDiffTarget({ field, oldValue, newValue });
              setDiffModalOpen(true);
            }}
            onShowQuizDetails={(quizId) => {
              const quizComp = activeData?.quizComparison?.find((q) => q.quizId === quizId);
              setSelectedQuiz(quizComp);
              setQuizModalOpen(true);
            }}
            onShowAssignmentDetails={(assignmentId) => {
              const assignComp = activeData?.assignmentComparison?.find((a) => a.assignmentId === assignmentId);
              setSelectedAssign(assignComp);
              setAssignModalOpen(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/course/list")}
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          Back to Course Management
        </Button>
      </Box>

      {/* Header with Title and Action buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <PageTitle title="Course Changes Comparison" />
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<UnpublishedIcon />}
            onClick={() => setUnpublishOpen(true)}
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            Unpublish Course
          </Button>
        </Box>
      </Box>

      <CustomBreadcrumbs />

      {/* Course Header Info */}
      <Card sx={cardSx}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <Avatar
              variant="rounded"
              src={activeData?.courseImageUrl}
              sx={{ width: "100%", height: "auto", aspectRatio: "16/9", borderRadius: "10px", border: "1px solid #E5E7EB" }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 9, md: 10 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
              {activeData?.courseTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {activeData?.courseSubtitle}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "text.tertiary", mt: 1 }}>
              {noSnapshot ? (
                "No approved snapshot available for comparison."
              ) : (
                <>
                  Last Approved: <strong>{new Date(activeData?.snapshotTakenAt).toLocaleString()}</strong> |
                  Submission Attempt: <strong>#{activeData?.approvedSubmissionNumber}</strong>
                </>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Summary Status Banner */}
      {noSnapshot ? (
        <Card sx={{ ...cardSx, bgcolor: "info.lighter", border: "1px solid", borderColor: "info.light", display: "flex", gap: 2, alignItems: "center" }}>
          <InfoIcon color="info" />
          <Typography variant="body2" sx={{ color: "info.darker", fontWeight: 600 }}>
            This course was published directly or has no approval history. No changes can be computed.
          </Typography>
        </Card>
      ) : hasChanges ? (
        <Card sx={{ ...cardSx, bgcolor: "warning.lighter", border: "1px solid", borderColor: "warning.light", display: "flex", gap: 2, alignItems: "center" }}>
          <WarningAmberIcon color="warning" />
          <Typography variant="body2" sx={{ color: "warning.darker", fontWeight: 600 }}>
            Changes detected across multiple categories since last approval. Review the details below.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ ...cardSx, bgcolor: "success.lighter", border: "1px solid", borderColor: "success.light", display: "flex", gap: 2, alignItems: "center" }}>
          <CheckCircleIcon color="success" />
          <Typography variant="body2" sx={{ color: "success.darker", fontWeight: 600 }}>
            No changes detected. The current course draft matches the latest approved snapshot.
          </Typography>
        </Card>
      )}

      {/* Sidebar + Detail View Layout */}
      {!noSnapshot && (
        <Grid container spacing={3}>
          {/* Sidebar (Sticky) */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box
              sx={{
                position: "sticky",
                top: "100px",
                zIndex: 10,
              }}
            >
              <Card sx={{ p: 2, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "none", bgcolor: "#FFF" }}>
                <List component="nav" sx={{ p: 0 }}>
                  {allCategories.map((category) => {
                    const isActive = activeCategory === category;
                    const changeCount = getChangeCountForCategory(category);
                    const hasChangesInCategory = changeCount > 0;

                    return (
                      <ListItemButton
                        key={category}
                        selected={isActive}
                        onClick={() => setActiveCategory(category)}
                        sx={{
                          borderRadius: "10px",
                          mb: 1,
                          py: 1.5,
                          px: 2,
                          "&.Mui-selected": {
                            bgcolor: "brand.lighter",
                            color: "brand.dark",
                            "&:hover": {
                              bgcolor: "brand.lighter",
                            },
                          },
                        }}
                      >
                        <ListItemText
                          primary={category}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? "brand.dark" : "text.primary",
                          }}
                        />
                        {hasChangesInCategory && (
                          <Chip
                            label={changeCount}
                            size="small"
                            color="warning"
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              height: 20,
                              minWidth: 20,
                              px: 0.5,
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Card>
            </Box>
          </Grid>

          {/* Details Column */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ p: 4, borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "none", minHeight: "500px", bgcolor: "#FFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {activeCategory} Changes Detail
                </Typography>
                {getChangeCountForCategory(activeCategory) === 0 && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                    label="No changes in this category"
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* RENDER ACTIVE CATEGORY CONTENT */}
              {renderCategoryDetails()}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialogs & Modals */}
      <UnpublishDialog
        open={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublishConfirm}
        courseTitle={activeData?.courseTitle ?? ""}
        isSubmitting={unpublishPending}
      />

      <HtmlDiffModal
        open={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        field={diffTarget.field}
        oldValue={diffTarget.oldValue}
        newValue={diffTarget.newValue}
      />

      <QuizComparisonModal
        open={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        title={selectedQuiz?.newTitle ?? ""}
        quiz={selectedQuiz}
      />

      <AssignmentComparisonModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={selectedAssign?.newTitle ?? ""}
        assignment={selectedAssign}
      />

      <Box sx={{ height: 80 }} />
    </Box>
  );
}
