import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography } from "@mui/material";

import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import useDebounce from "../../../../hooks/common/useDebounce";
import useGetPublishedCoursesForAdmin from "../../../../hooks/course-hooks/useGetPublishedCoursesForAdmin";
import useGetCourseManagementStats from "../../../../hooks/course-hooks/useGetCourseManagementStats";
import useUnpublishCourse from "../../../../hooks/course-hooks/useUnpublishCourse";

import CourseStatCards from "./components/CourseStatCards";
import PublishedCoursesDataGrid from "./components/PublishedCoursesDataGrid";
import UnpublishDialog from "./components/UnpublishDialog";

export default function CourseManagementPage() {
  const navigate = useNavigate();

  // Filter & Search State
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);
  const [categoryId, setCategoryId] = useState(null);
  const [modifiedOnly, setModifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recently_modified");

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [unpublishTarget, setUnpublishTarget] = useState(null);

  // API Queries
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetCourseManagementStats();
  
  const { 
    data: coursesData, 
    isLoading: coursesLoading, 
    isFetching: coursesFetching, 
    refetch: refetchCourses 
  } = useGetPublishedCoursesForAdmin({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    searchQuery: debouncedSearch,
    categoryId: categoryId,
    modifiedOnly: modifiedOnly,
    sortBy: sortBy,
  });

  const { mutate: unpublish, isPending: unpublishPending } = useUnpublishCourse();

  const handleRefresh = () => {
    refetchStats();
    refetchCourses();
  };

  const handleUnpublishConfirm = (reason) => {
    if (!unpublishTarget) return;
    unpublish(
      { courseId: unpublishTarget.courseId, reason },
      {
        onSuccess: () => {
          setUnpublishTarget(null);
          handleRefresh();
        },
      }
    );
  };

  const handleViewChanges = (course) => {
    navigate(`/admin/course/${course.courseId}/changes`);
  };

  const items = coursesData?.items ?? [];
  const totalCount = coursesData?.totalCount ?? 0;

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle title="Course Management" />
      </Box>

      <CustomBreadcrumbs />

      {/* Row 1: Stat Cards */}
      <Box sx={{ mt: 4 }}>
        <CourseStatCards stats={stats} isLoading={statsLoading} />
      </Box>

      {/* Title separator */}
      <Box sx={{ mt: 5, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Published Courses
        </Typography>
      </Box>

      {/* Row 2: DataGrid */}
      <PublishedCoursesDataGrid
        items={items}
        totalCount={totalCount}
        isLoading={coursesLoading}
        searchText={searchText}
        onSearchChange={setSearchText}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        modifiedOnly={modifiedOnly}
        onModifiedOnlyChange={setModifiedOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        onRefresh={handleRefresh}
        isRefreshing={coursesFetching}
        onUnpublishClick={(course) => setUnpublishTarget(course)}
        onViewChangesClick={handleViewChanges}
      />

      {/* Dialogs */}
      <UnpublishDialog
        open={Boolean(unpublishTarget)}
        onClose={() => setUnpublishTarget(null)}
        onConfirm={handleUnpublishConfirm}
        courseTitle={unpublishTarget?.title ?? ""}
        isSubmitting={unpublishPending}
      />

      <Box sx={{ height: 80 }} />
    </Box>
  );
}
