import React, { useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import RatingStatistics from "./rating-tab/RatingStatistics";
import ReviewsFilter from "./rating-tab/ReviewsFilter";
import ReviewsList from "./rating-tab/ReviewsList";
import { useGetRatingsByCourse } from "../../../../hooks/useRatingCourse";
import { useParams } from "react-router-dom";

// courseId: required prop for fetching ratings
function CourseLearnTab() {
  const { courseId } = useParams();
  const [active, setActive] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Fetch ratings from API
  const { data: ratingsData, isLoading, error } = useGetRatingsByCourse(
    courseId,
    pageNumber,
    pageSize,
    starFilter || null,
    sortBy
  );

  // Transform API data to component format
  const allRatings = useMemo(() => {
    if (!ratingsData?.items) return [];
    return ratingsData.items.map((item) => ({
      id: item.id,
      name: item.userFullName || "Anonymous",
      rating: item.rating,
      modifiedAt: item.lastModified || item.created,
      content: item.review || "",
      avatar: item.userAvatar
    }));
  }, [ratingsData]);

  // Client-side search filter (for current page)
  const filteredList = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (q === "") return allRatings;
    return allRatings.filter((r) => {
      const matchesQuery =
        (r.content && r.content.toLowerCase().includes(q)) || 
        (r.name && r.name.toLowerCase().includes(q));
      return matchesQuery;
    });
  }, [allRatings, searchQuery]);

  const handleStarFilterChange = (newFilter) => {
    setStarFilter(newFilter);
    setPageNumber(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPageNumber(1);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "white", minHeight: "500px" }}>
      <Box sx={{ display: "flex", gap: 3, borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}>
        <Button color={active === "overview" ? "primary" : "inherit"} onClick={() => setActive("overview")}>
          Overview
        </Button>
        <Button color={active === "reviews" ? "primary" : "inherit"} onClick={() => setActive("reviews")}>
          Reviews
        </Button>
        <Button color={active === "notes" ? "primary" : "inherit"} onClick={() => setActive("notes")}>
          Notes
        </Button>
      </Box>

      {active === "overview" && (
        <Box sx={{ p: 4, bgcolor: "#f0f2f5", borderRadius: 2 }}>
          <Typography>
            <strong>Overview:</strong>
            <br /> Đây là nơi hiển thị thông tin tổng quan của khóa học.
          </Typography>
        </Box>
      )}

      {active === "reviews" && (
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error">Failed to load ratings. Please try again.</Typography>
            </Box>
          ) : (
            <>
              <RatingStatistics reviews={allRatings} />
              <ReviewsFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                starFilter={starFilter}
                onStarFilterChange={handleStarFilterChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
              <ReviewsList reviews={filteredList} />
              
              {/* Pagination info */}
              {ratingsData && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {ratingsData.pageNumber} of {ratingsData.totalPages} ({ratingsData.totalCount} total reviews)
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      disabled={!ratingsData.hasPreviousPage}
                      onClick={() => setPageNumber(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      disabled={!ratingsData.hasNextPage}
                      onClick={() => setPageNumber(p => p + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {active === "notes" && (
        <Box sx={{ p: 4, bgcolor: "#f0f2f5", borderRadius: 2 }}>
          <Typography>Notes area (placeholder)</Typography>
        </Box>
      )}
    </Box>
  );
}

export default CourseLearnTab;