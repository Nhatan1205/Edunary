import { useState } from "react";
import { Box, Typography } from "@mui/material";

import CustomBreadcrumbs from "../../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../../components/PageTitle";
import useDebounce from "../../../../../hooks/common/useDebounce";
import useGetCourseReviewSubmissions from "../../../../../hooks/course-review-hooks/useGetCourseReviewSubmissions";
import useGetCourseReviewSubmissionsCounts from "../../../../../hooks/course-review-hooks/useGetCourseReviewSubmissionsCounts";
import CourseApprovalDataGrid from "./CourseApprovalDataGrid";

export default function CourseApprovalsPage() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 500);

  const [activeTab, setActiveTab] = useState(0);
  const [isFirstOnly, setIsFirstOnly] = useState(false);
  const [sortBy, setSortBy] = useState("submitted_asc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isFetching, refetch } = useGetCourseReviewSubmissions({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    status: activeTab,
    isFirstSubmissionOnly: isFirstOnly,
    searchQuery: debouncedSearch,
    sortBy: sortBy,
  });

  const { data: countsData, refetch: refetchCounts } = useGetCourseReviewSubmissionsCounts({
    isFirstSubmissionOnly: isFirstOnly,
    searchQuery: debouncedSearch,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const counts = {
    0: countsData?.pendingCount ?? 0,
    1: countsData?.needsChangesCount ?? 0,
    2: countsData?.approvedCount ?? 0,
  };

  const handleRefresh = () => {
    refetch();
    refetchCounts();
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle title="Course Approvals" />
      </Box>

      <CustomBreadcrumbs />

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Pending Reviews
        </Typography>
      </Box>

      <CourseApprovalDataGrid
        items={items}
        totalCount={totalCount}
        counts={counts}
        isLoading={isLoading}
        searchText={searchText}
        onSearchChange={setSearchText}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFirstOnly={isFirstOnly}
        onFirstOnlyChange={setIsFirstOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      <Box sx={{ height: 80 }} />
    </Box>
  );
}
