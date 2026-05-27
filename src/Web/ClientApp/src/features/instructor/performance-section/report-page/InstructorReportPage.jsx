import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Paper, Stack, Tab, Tabs } from "@mui/material";
import MainCard from "../../../../components/instructor-layout/MainCard";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import useGetInstructorReport from "../../../../hooks/instructor-report-hooks/useGetInstructorReport";
import { extractApiError } from "../../../../utils/helpers.js";
import EnrollmentTrendPanel from "./components/EnrollmentTrendPanel";
import RatingTrendPanel from "./components/RatingTrendPanel";
import ReportHeaderFilters from "./components/ReportHeaderFilters";
import ReportSummary from "./components/ReportSummary";
import RevenueTrendPanel from "./components/RevenueTrendPanel";
import {
  getDefaultDateRange,
  getSummaryCards,
  REVENUE_REPORT_PERMISSION,
} from "./reportPageUtils";
import NoData from "../../../../components/NoData";
import emptyAnalyticsImg from "../../../../assets/images/empty-analytics.png";

export default function InstructorReportPage() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const MAX_COURSE_DROPDOWN_SIZE = 1000;

  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesAuthor("", 0, 1, MAX_COURSE_DROPDOWN_SIZE, REVENUE_REPORT_PERMISSION);
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
    if (coursesData && coursesData.totalCount > MAX_COURSE_DROPDOWN_SIZE) {
      console.warn(
        `Course dropdown truncated: ${coursesData.totalCount} courses exist but only ${MAX_COURSE_DROPDOWN_SIZE} are loaded.`
      );
    }
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
    if (selectedCourseId === "") return "All courses";
    return courseOptions.find((option) => option.value === selectedCourseId)?.label ?? "All courses";
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

        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 340,
            }}
          >
            <LoadingSpinner message="Loading report data..." />
          </Box>
        )}

        {showEmptyState && <NoData
              image={emptyAnalyticsImg}
              title="No report access"
              description="You do not have any course with RevenueReport permission yet. Ask the course owner to grant access, then refresh this page."
        />
        }

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
