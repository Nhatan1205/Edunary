import { useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Stack, Checkbox, FormControlLabel,
} from "@mui/material";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import NoData from "../../../../components/NoData";
import emptyReviewsImg from "../../../../assets/images/empty-reviews.png";
import CustomPagination from "../../../../components/pagination/CustomPagination";
import DefaultSelect from "../../../../components/drop-down/DefaultSelect";
import ReviewPanel, { ReviewPanelSkeleton } from "./ReviewPanel";
import useGetInstructorReviews from "../../../../hooks/rating-hooks/useGetInstructorReviews";
import useUpsertRatingResponse from "../../../../hooks/rating-hooks/useUpsertRatingResponse";
import useDeleteRatingResponse from "../../../../hooks/rating-hooks/useDeleteRatingResponse";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";

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
        list.push({ value: c.id, label: c.title, isOwner: c.isOwner, isCollaborator: c.isCollaborator, });
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

  const selectedCourseOption = courseOptions.find((o) => o.value === (selectedCourseId ?? "all")) ?? courseOptions[0];
  const selectedRatingOption = RATING_OPTIONS.find((o) => o.value === ratingFilter) ?? RATING_OPTIONS[0];
  const selectedSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];

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

        <DefaultSelect
          data={courseOptions}
          value={[selectedCourseOption]}
          onChange={([item]) => handleCourseChange(item?.value ?? "all")}
          defaultLabel="All courses"
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
        <DefaultSelect
          data={RATING_OPTIONS}
          value={[selectedRatingOption]}
          onChange={([item]) => handleRatingChange(item?.value ?? "all")}
          defaultLabel="Rating: All"
        />
        <DefaultSelect
          data={SORT_OPTIONS}
          value={[selectedSortOption]}
          onChange={([item]) => handleSortChange(item?.value ?? "newest")}
          defaultLabel="Newest first"
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
          image={emptyReviewsImg}
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
