import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import DOMPurify from "dompurify";
import {
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";

import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCourseChangesComparison from "../../../../hooks/course-review-hooks/useGetCourseChangesComparison";
import useUnpublishCourse from "../../../../hooks/course-hooks/useUnpublishCourse";
import UnpublishDialog from "../course-management/components/UnpublishDialog";

const cardSx = {
  p: 3,
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  mb: 3,
};

function ChangeTypeChip({ type }) {
  const styles = {
    added: { bgcolor: "success.lighter", color: "success.main", label: "Added" },
    removed: { bgcolor: "error.lighter", color: "error.main", label: "Removed" },
    modified: { bgcolor: "warning.lighter", color: "warning.main", label: "Modified" },
  };

  const style = styles[type] || styles.modified;

  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 700,
        fontSize: "0.7rem",
        height: 20,
      }}
    />
  );
}

function RenderDiffValue({ field, value, color }) {
  if (!value || value === "—") return <Typography variant="body2" sx={{ color: color, mt: 0.5 }}>—</Typography>;

  if (field === "Course Image") {
    return (
      <Box sx={{ mt: 1, maxWidth: 320, borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
        <img src={value} alt="Preview" style={{ width: "100%", height: "auto", display: "block" }} />
      </Box>
    );
  }

  const isHtml = ["Description", "Welcome Message", "Congratulations Message"].includes(field);

  if (isHtml) {
    return (
      <Typography
        variant="body2"
        component="div"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }}
        sx={{
          color: color,
          mt: 0.5,
          lineHeight: 1.6,
          wordBreak: "break-word",
          "& p": { mt: 0, mb: 1 },
          "& ul": { pl: 2, mt: 0 },
          "& li": { mb: 0.5 },
        }}
      />
    );
  }

  return (
    <Typography variant="body2" sx={{ color: color, mt: 0.5, wordBreak: "break-word", fontWeight: color === "success.main" ? 600 : 400 }}>
      {value}
    </Typography>
  );
}

function DetailItem({ detail }) {
  const isAdded = detail.type === "added";
  const isRemoved = detail.type === "removed";

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.5 }}>
      {isAdded && <AddIcon sx={{ color: "success.main", fontSize: 16, mt: 0.25 }} />}
      {isRemoved && <RemoveIcon sx={{ color: "error.main", fontSize: 16, mt: 0.25 }} />}
      {!isAdded && !isRemoved && <EditIcon sx={{ color: "warning.main", fontSize: 16, mt: 0.25 }} />}

      <Box sx={{ flex: 1 }}>
        {detail.item && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {detail.item}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {detail.value && detail.value}
          {detail.oldValue && (
            <span>
              {" "}
              Before: <span style={{ textDecoration: "line-through" }}>{detail.oldValue}</span> | After:{" "}
              <strong>{detail.newValue}</strong>
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
}

export default function CourseChangesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({});

  const id = parseInt(courseId, 10);

  const { data: comparison, isLoading: compareLoading, refetch } = useGetCourseChangesComparison(id);
  const { mutate: unpublish, isPending: unpublishPending } = useUnpublishCourse();

  const allCategories = [
    "Basic Info",
    "Intended Learners",
    "Topics",
    "Media",
    "Curriculum",
    "Assessment",
  ];

  useEffect(() => {
    if (comparison?.changeGroups) {
      const initial = {};
      allCategories.forEach((cat) => {
        const group = comparison.changeGroups.find((g) => g.category === cat);
        initial[cat] = (group?.changes?.length ?? 0) > 0;
      });
      setExpandedAccordions(initial);
    }
  }, [comparison]);

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

  if (compareLoading) {
    return (
      <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/course/list")}
            sx={{ color: "text.secondary", fontWeight: 600 }}
            disabled
          >
            Back to Course Management
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <PageTitle title="Course Changes Comparison" />
        </Box>

        <CustomBreadcrumbs />

        {/* Course Header Info Skeleton */}
        <Card sx={cardSx}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 3, md: 2 }}>
              <Skeleton
                variant="rounded"
                width="100%"
                height="auto"
                sx={{ aspectRatio: "16/9", borderRadius: "10px" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 9, md: 10 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="45%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
            </Grid>
          </Grid>
        </Card>

        {/* Summary Status Banner Skeleton */}
        <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: "16px", mb: 3 }} />

        {/* Accordions Skeletons */}
        <Box sx={{ mb: 4 }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rounded"
              width="100%"
              height={56}
              sx={{ mb: 1.5, borderRadius: "12px" }}
            />
          ))}
        </Box>

        {/* Action Footer Bar Skeleton */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            pt: 3,
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={180} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>
    );
  }

  const hasChanges = comparison?.hasChanges ?? false;
  const noSnapshot = comparison?.noSnapshot ?? false;

  const changeGroups = comparison?.changeGroups ?? [];

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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageTitle title="Course Changes Comparison" />
      </Box>

      <CustomBreadcrumbs />

      {/* Course Header Info */}
      <Card sx={cardSx}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <Avatar
              variant="rounded"
              src={comparison?.courseImageUrl}
              sx={{ width: "100%", height: "auto", aspectRatio: "16/9", borderRadius: "10px", border: "1px solid #E5E7EB" }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 9, md: 10 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
              {comparison?.courseTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {comparison?.courseSubtitle}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: "text.tertiary", mt: 1 }}>
              {noSnapshot ? (
                "No approved snapshot available for comparison."
              ) : (
                <>
                  Last Approved: <strong>{new Date(comparison?.snapshotTakenAt).toLocaleString()}</strong> |
                  Submission Attempt: <strong>#{comparison?.approvedSubmissionNumber}</strong>
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
            {comparison.totalChanges} change{comparison.totalChanges > 1 ? "s" : ""} detected across{" "}
            {changeGroups.length} categories since last approval.
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

      {/* Accordions */}
      {!noSnapshot && (
        <Box sx={{ mb: 4 }}>
          {allCategories.map((category) => {
            const group = changeGroups.find((g) => g.category === category);
            const groupChanges = group?.changes ?? [];
            const hasGroupChanges = groupChanges.length > 0;

            return (
              <Accordion
                key={category}
                expanded={!!expandedAccordions[category]}
                onChange={(_, isExpanded) => {
                  setExpandedAccordions((prev) => ({ ...prev, [category]: isExpanded }));
                }}
                disabled={!hasGroupChanges}
                sx={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px !important",
                  boxShadow: "none",
                  mb: 1.5,
                  "&:before": { display: "none" },
                  ...(hasGroupChanges && {
                    boxShadow: "0px 1px 3px rgba(16,24,40,0.05)",
                  }),
                }}
              >
                <AccordionSummary
                  expandIcon={hasGroupChanges ? <ExpandMoreIcon /> : null}
                  sx={{ px: 3, py: 0.5 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                    {hasGroupChanges ? (
                      <WarningAmberIcon color="warning" sx={{ fontSize: 20 }} />
                    ) : (
                      <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                    )}
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: hasGroupChanges ? "text.primary" : "text.secondary" }}>
                      {category}
                    </Typography>
                    {hasGroupChanges && (
                      <Chip
                        label={`${groupChanges.length} changes`}
                        size="small"
                        color="warning"
                        sx={{ fontSize: "0.75rem", fontWeight: 600, height: 20 }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 1, borderTop: "1px solid #F3F4F6" }}>
                  {groupChanges.map((change, idx) => (
                    <Box key={idx} sx={{ mt: idx === 0 ? 0 : 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                          {change.field}
                        </Typography>
                        <ChangeTypeChip type={change.changeType} />
                      </Box>

                      {/* Display summary if present */}
                      {change.summary && (
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontWeight: 500 }}>
                          {change.summary}
                        </Typography>
                      )}

                      {/* Before / After side-by-side or stacked block for scalar fields */}
                      {change.changeType === "modified" && change.oldValue !== undefined && change.newValue !== undefined && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "10px",
                            bgcolor: "grey.50",
                            border: "1px dashed #E5E7EB",
                            mt: 1,
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.tertiary", fontWeight: 600 }}>
                                BEFORE
                              </Typography>
                              <RenderDiffValue field={change.field} value={change.oldValue} color="error.main" />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Typography variant="caption" sx={{ color: "text.tertiary", fontWeight: 600 }}>
                                AFTER
                              </Typography>
                              <RenderDiffValue field={change.field} value={change.newValue} color="success.main" />
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {/* Display nested detail items */}
                      {change.details && change.details.length > 0 && (
                        <Box sx={{ pl: 1.5, mt: 1, borderLeft: "2px solid #E5E7EB" }}>
                          {change.details.map((detail, dIdx) => (
                            <DetailItem key={dIdx} detail={detail} />
                          ))}
                        </Box>
                      )}

                      {idx < groupChanges.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Action Footer Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          pt: 3,
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          startIcon={<UnpublishedIcon />}
          onClick={() => setUnpublishOpen(true)}
          sx={{ borderRadius: "8px", fontWeight: 600 }}
        >
          Unpublish Course
        </Button>
      </Box>

      {/* Dialog */}
      <UnpublishDialog
        open={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublishConfirm}
        courseTitle={comparison?.courseTitle ?? ""}
        isSubmitting={unpublishPending}
      />

      <Box sx={{ height: 80 }} />
    </Box>
  );
}
