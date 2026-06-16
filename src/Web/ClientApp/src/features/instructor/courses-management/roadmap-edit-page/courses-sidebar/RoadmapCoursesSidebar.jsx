import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import useGetPublicCoursesByUserId from "../../../../../hooks/course-hooks/useGetPublicCoursesByUserId";
import useGetBasicUserInfo from "../../../../../hooks/auth-hooks/useGetBasicUserInfor";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import CustomPagination from "../../../../../components/pagination/CustomPagination";
import SidebarCourseCard from "./SidebarCourseCard";
import { useRoadmapEditor } from "../../../../../context/RoadmapEditorContext";
import NoData from "../../../../../components/NoData";
import emptyStateImg from "../../../../../assets/images/empty-courses.png";

const SIDEBAR_WIDTH = 380;

export default function RoadmapCoursesSidebar() {
    const { coursesSidebarOpen, closeSidebar, addedCourseIds } = useRoadmapEditor();

    const [searchText, setSearchText] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pageNumber, setPageNumber] = useState(1);

    const { data: user, isLoading: isLoadingUser } = useGetBasicUserInfo();
    const { data: coursesData, isLoading: isLoadingCourses } = useGetPublicCoursesByUserId(user?.userId, 1, 999);

    const isLoading = isLoadingUser || isLoadingCourses;

    // Client-side filtering by search query
    const filteredCourses = useMemo(() => {
        const items = coursesData?.items || [];
        if (!appliedSearch) return items;
        const search = appliedSearch.toLowerCase();
        return items.filter((course) =>
            course.title?.toLowerCase().includes(search) ||
            course.subtitle?.toLowerCase().includes(search)
        );
    }, [coursesData?.items, appliedSearch]);

    // Client-side pagination
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const paginatedCourses = useMemo(() => {
        return filteredCourses.slice(
            (pageNumber - 1) * itemsPerPage,
            pageNumber * itemsPerPage
        );
    }, [filteredCourses, pageNumber]);

    function handleSearch() {
        setAppliedSearch(searchText.trim());
        setPageNumber(1);
    }

    function handlePageChange(event, value) {
        setPageNumber(value);
    }

    if (!coursesSidebarOpen) return null;

    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: SIDEBAR_WIDTH,
                bgcolor: "background.paper",
                borderLeft: "1px solid",
                borderColor: "divider",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1.5,
                }}
            >
                <Typography
                    sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}
                >
                    Your Courses
                </Typography>
                <IconButton size="small" onClick={closeSidebar}>
                    <CloseIcon sx={{ fontSize: "1.2rem" }} />
                </IconButton>
            </Box>

            {/* Search */}
            <Box sx={{ px: 2, py: 1.5 }}>
                <TextField
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    size="small"
                    fullWidth
                    placeholder="Search courses..."
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#9ca3af", fontSize: "1.2rem" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "brand.main",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "brand.main",
                            },
                        },
                    }}
                />
            </Box>

            {/* Course list */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 2,
                    pb: 2,
                }}
            >
                {isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            py: 6,
                        }}
                    >
                        <LoadingSpinner size={40} />
                    </Box>
                ) : paginatedCourses.length > 0 ? (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 1.5,
                        }}
                    >
                        {paginatedCourses.map((course) => (
                            <SidebarCourseCard
                                key={course.id}
                                course={course}
                                disabled={addedCourseIds?.has(course.id)}
                            />
                        ))}
                    </Box>
                ) : (
                    <NoData
                        image={emptyStateImg}
                        title={appliedSearch ? "No results found" : "No courses found"}
                        description={appliedSearch ? `No courses match "${appliedSearch}"` : "You haven't created any courses yet."}
                        imageWidth={100}
                        minHeight="200px"
                    />
                )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box
                    sx={{
                        borderTop: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        justifyContent: "center",
                        px: 1,
                        "& .MuiPagination-ul": {
                            flexWrap: "nowrap",
                        },
                    }}
                >
                    <CustomPagination
                        count={totalPages}
                        page={pageNumber}
                        onChange={handlePageChange}
                        siblingCount={1}
                        boundaryCount={0}
                    />
                </Box>
            )}
        </Box>
    );
}
