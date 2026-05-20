import { useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Stack, Checkbox,
  FormControlLabel, FormControl, Select, MenuItem,
} from "@mui/material";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import NoData from "../../../../components/NoData";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CustomPagination from "../../../../components/pagination/CustomPagination";
import ReviewPanel, { ReviewPanelSkeleton } from "./ReviewPanel";
import useGetInstructorReviews from "../../../../hooks/rating-hooks/useGetInstructorReviews";
import useUpsertRatingResponse from "../../../../hooks/rating-hooks/useUpsertRatingResponse";
import useDeleteRatingResponse from "../../../../hooks/rating-hooks/useDeleteRatingResponse";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";

// ─── SelectFilter ─────────────────────────────────────────────────────────────
function SelectFilter({ value, onChange, options, minWidth = 160 }) {
  return (
    <FormControl size="small" sx={{ minWidth }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          borderRadius: 2, bgcolor: "background.paper",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ─── Filter / Sort constants ───────────────────────────────────────────────────
const RATING_OPTIONS = [
  { value: "all", label: "Rating: All" },
  { value: "5", label: "★★★★★  (5 stars)" },
  { value: "4", label: "★★★★☆  (4 stars)" },
  { value: "3", label: "★★★☆☆  (3 stars)" },
  { value: "2", label: "★★☆☆☆  (2 stars)" },
  { value: "1", label: "★☆☆☆☆  (1 star)" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  // ── Filter state ──
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [notAnswered, setNotAnswered] = useState(false);
  const [hasComment, setHasComment] = useState(false);

  // ── Query params memo ──
  const queryParams = useMemo(() => ({
    pageNumber,
    pageSize: 10,
    courseId: selectedCourseId,
    rating: ratingFilter === "all" ? null : parseInt(ratingFilter),
    notAnswered: notAnswered ? true : null,
    hasComment: hasComment ? true : null,
    sortBy,
  }), [pageNumber, selectedCourseId, ratingFilter, notAnswered, hasComment, sortBy]);

  // ── Hooks ──
  const { data, isLoading } = useGetInstructorReviews(queryParams);
  const { data: coursesData } = useGetCoursesAuthor("", 0, 1, 100, 32);
  const { mutate: upsertResponse } = useUpsertRatingResponse();
  const { mutate: deleteResponse } = useDeleteRatingResponse();

  // ── Mutation handlers ──
  const handleRespond = useCallback((reviewId, text) => {
    upsertResponse({ ratingCourseId: reviewId, responseText: text });
  }, [upsertResponse]);

  const handleEditResponse = useCallback((reviewId, text) => {
    upsertResponse({ ratingCourseId: reviewId, responseText: text });
  }, [upsertResponse]);

  const handleDeleteResponse = useCallback((reviewId) => {
    deleteResponse(reviewId);
  }, [deleteResponse]);

  // ── Course options list ──
  const courseOptions = useMemo(() => {
    const list = [{ value: "all", label: "All courses" }];
    if (coursesData && coursesData.items) {
      coursesData.items.forEach((c) => {
        list.push({ value: c.id, label: c.title });
      });
    }
    return list;
  }, [coursesData]);

  const handleCourseChange = useCallback((val) => {
    setSelectedCourseId(val === "all" ? null : val);
    setPageNumber(1);
  }, []);

  const handleRatingChange = useCallback((val) => {
    setRatingFilter(val);
    setPageNumber(1);
  }, []);

  const handleSortChange = useCallback((val) => {
    setSortBy(val);
    setPageNumber(1);
  }, []);

  const handleNotAnsweredChange = useCallback((e) => {
    setNotAnswered(e.target.checked);
    setPageNumber(1);
  }, []);

  const handleHasCommentChange = useCallback((e) => {
    setHasComment(e.target.checked);
    setPageNumber(1);
  }, []);

  const reviews = data?.items || [];
  const isAllCourses = selectedCourseId === null;

  return (
    <MainCard>
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        flexDirection={{ xs: "column", md: "row" }}
        mb={3}
        gap={4}
      >
        <Box>
          <PageTitle
            title="Reviews"
            subtitle="See what students are saying about your courses"
          />
        </Box>

        <SelectFilter
          value={selectedCourseId === null ? "all" : selectedCourseId}
          onChange={handleCourseChange}
          options={courseOptions}
          minWidth={260}
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{ mb: 3 }}
      >
        {/* Checkboxes */}
        <FormControlLabel
          control={
            <Checkbox
              checked={notAnswered}
              onChange={handleNotAnsweredChange}
              size="small"
              sx={{ color: "brand.main", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={<Typography variant="body2" fontWeight={500}>Not answered</Typography>}
          sx={{ ml: 0, mr: 0 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={hasComment}
              onChange={handleHasCommentChange}
              size="small"
              sx={{ color: "brand.main", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={<Typography variant="body2" fontWeight={500}>Has a comment</Typography>}
          sx={{ ml: 0, mr: 0 }}
        />

        {/* Dropdowns */}
        <SelectFilter
          value={ratingFilter}
          onChange={handleRatingChange}
          options={RATING_OPTIONS}
          minWidth={160}
        />
        <SelectFilter
          value={sortBy}
          onChange={handleSortChange}
          options={SORT_OPTIONS}
          minWidth={150}
        />
      </Stack>

      {/* ── Review list ── */}
      {isLoading ? (
        <Stack spacing={2}>
          <ReviewPanelSkeleton showCourseHeader={isAllCourses} />
          <ReviewPanelSkeleton showCourseHeader={isAllCourses} />
          <ReviewPanelSkeleton showCourseHeader={isAllCourses} />
        </Stack>
      ) : reviews.length === 0 ? (
        <NoData
          title="No reviews found"
          description="Try adjusting your filters, or wait for students to leave reviews on your courses."
          minHeight="300px"
        />
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <ReviewPanel
              key={review.id}
              review={review}
              showCourseHeader={isAllCourses}
              onRespond={handleRespond}
              onEditResponse={handleEditResponse}
              onDeleteResponse={handleDeleteResponse}
            />
          ))}
          {data?.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CustomPagination
                count={data.totalPages}
                page={pageNumber}
                onChange={(_, page) => setPageNumber(page)}
              />
            </Box>
          )}
        </Stack>
      )}
    </MainCard>
  );
}
