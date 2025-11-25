import { useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import RatingStatistics from "./RatingStatistics";
import ReviewsFilter from "./ReviewsFilter";
import ReviewsList from "./ReviewsList";
import { useGetRatingsByCourse } from "../../../../../hooks/useRatingCourse";
import { useParams } from "react-router-dom";

function RatingTab() {
  const { courseId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data: ratingsData, isLoading, error } = useGetRatingsByCourse(
    courseId,
    pageNumber,
    pageSize,
    starFilter || null,
    sortBy
  );

  const allRatings = useMemo(() => {
    if (!ratingsData?.items) return [];
    return ratingsData.items.map((item) => ({
      id: item.id,
      name: item.userFullName || "Anonymous",
      rating: item.rating,
      modifiedAt: item.lastModified || item.created,
      content: item.review || "",
      avatar: item.userAvatar,
    }));
  }, [ratingsData]);

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
    <Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
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

          {ratingsData && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Page {ratingsData.pageNumber} of {ratingsData.totalPages} ({ratingsData.totalCount} total reviews)
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!ratingsData.hasPreviousPage}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!ratingsData.hasNextPage}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default RatingTab;
