import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Paper, Stack, Tab, Tabs } from "@mui/material";
import MainCard from "../../../../components/instructor-layout/MainCard";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import useGetInstructorReport from "../../../../hooks/instructor-report-hooks/useGetInstructorReport";
import { extractApiError } from "../../../../utils/helpers.js";
import EnrollmentTrendPanel from "./components/EnrollmentTrendPanel";
import RatingTrendPanel from "./components/RatingTrendPanel";
import ReportHeaderFilters from "./components/ReportHeaderFilters";
import ReportLoadingState from "./components/ReportLoadingState";
import ReportNoAccessState from "./components/ReportNoAccessState";
import ReportSummary from "./components/ReportSummary";
import RevenueTrendPanel from "./components/RevenueTrendPanel";
import {
  getDefaultDateRange,
  getSummaryCards,
  REVENUE_REPORT_PERMISSION,
} from "./reportPageUtils";

export default function InstructorReportPage() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesAuthor("", 0, 1, 1000, REVENUE_REPORT_PERMISSION);
  const courseOptions = useMemo(() => {
    const items = coursesData?.items ?? [];
    return items.map((course) => ({
      value: String(course.id),
      label: course.title,
      isOwner: course.isOwner,
      isCollaborator: course.isCollaborator,
    }));
  }, [coursesData]);

  useEffect(() => {
    if (selectedCourseId !== "" && !courseOptions.some((option) => option.value === selectedCourseId)) {
      setSelectedCourseId("");
    }
  }, [courseOptions, selectedCourseId]);

  const reportCourseId = selectedCourseId === "" ? null : Number(selectedCourseId);
  const { data: reportData, isLoading, error } = useGetInstructorReport(from, to, reportCourseId);
  const totalRatings = Number(reportData?.summary?.totalRatings ?? reportData?.ratingCount?.total ?? 0);
  const summaryCards = getSummaryCards(reportData, totalRatings);

  const selectedCourseLabel = useMemo(() => {
    if (selectedCourseId === "") return "All accessible courses";
    return courseOptions.find((option) => option.value === selectedCourseId)?.label ?? "All accessible courses";
  }, [courseOptions, selectedCourseId]);

  const showEmptyState = !isLoading && !error && reportData && reportData.hasAccess === false;

  return (
    <MainCard>
      <Stack spacing={3}>
        <ReportHeaderFilters
          selectedCourseId={selectedCourseId}
          courseOptions={courseOptions}
          from={from}
          to={to}
          onCourseChange={setSelectedCourseId}
          onFromChange={setFrom}
          onToChange={setTo}
        />

        {error && (
          <Alert severity="error">
            {extractApiError(error) || error?.message || "Failed to load report data."}
          </Alert>
        )}

        {isLoading && <ReportLoadingState />}

        {showEmptyState && <ReportNoAccessState />}

        {!isLoading && !error && reportData?.hasAccess && (
          <>
            <ReportSummary
              summaryCards={summaryCards}
              selectedCourseLabel={selectedCourseLabel}
              coursesLoading={coursesLoading}
              courseCount={courseOptions.length}
            />

            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, next) => setActiveTab(next)}
                sx={{
                  px: 2,
                  pt: 0.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    minHeight: 52,
                  },
                }}
              >
                <Tab label="Revenue" />
                <Tab label="Enrollment" />
                <Tab label="Rating" />
              </Tabs>

              <Box sx={{ p: { xs: 2, md: 3 } }}>
                {activeTab === 0 && (
                  <RevenueTrendPanel
                    data={reportData?.revenue?.data ?? []}
                    aggregationLevel={reportData?.revenue?.aggregationLevel ?? "monthly"}
                  />
                )}

                {activeTab === 1 && (
                  <EnrollmentTrendPanel
                    data={reportData?.enrollment?.data ?? []}
                    aggregationLevel={reportData?.enrollment?.aggregationLevel ?? "monthly"}
                  />
                )}

                {activeTab === 2 && (
                  <RatingTrendPanel
                    ratingData={reportData?.rating?.data ?? []}
                    ratingCountData={reportData?.ratingCount?.data ?? []}
                    aggregationLevel={reportData?.rating?.aggregationLevel ?? reportData?.ratingCount?.aggregationLevel ?? "monthly"}
                    totalRatings={totalRatings}
                  />
                )}
              </Box>
            </Paper>
          </>
        )}
      </Stack>
    </MainCard>
  );
}
