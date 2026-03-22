import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import useGetCourses from "../../../hooks/course-hooks/useGetCourses";

function DropDownSearch({ searchValue, handleClose, debouncedValue }) {
    const { data: coursesData } = useGetCourses(debouncedValue.length > 2 ? decodeURIComponent(debouncedValue) : "", [], 0, 1, 4);

    return (
        <Box sx={{ py: 2, px: 1 }}>
            <Box
                component={RouterLink}
                to={{
                    pathname: "/course/search",
                    search: `?query=${encodeURIComponent(searchValue)}`
                }}
                onClick={handleClose}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    textDecoration: "none",
                    "&:hover": {
                        bgcolor: "#EDEFF0",
                    },
                }}
            >
                <SearchIcon sx={{ color: "text.primary", fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: "text.primary" }}>
                    Search for <strong>"{searchValue}"</strong>
                </Typography>
            </Box>
            {coursesData?.items && coursesData.items.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    {coursesData.items.map((course) => (
                        <Box
                            key={course.id}
                            component={RouterLink}
                            to={`/course/${course.id}`}
                            onClick={handleClose}
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                                px: 2,
                                py: 1.5,
                                textDecoration: "none",
                                "&:hover": {
                                    bgcolor: "#EDEFF0",
                                },
                            }}
                        >
                            {/* Course thumbnail */}
                            <Avatar
                                variant="square"
                                src={course.imageUrl}
                                alt={course.title}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1,
                                    flexShrink: 0,
                                }}
                            />

                            {/* Course info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "text.primary",
                                        fontWeight: 500,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        lineHeight: 1.4,
                                        mb: 0.5,
                                    }}
                                >
                                    {course.title}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        display: "block",
                                    }}
                                >
                                    Course • {course.topic || "General"}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default DropDownSearch;
