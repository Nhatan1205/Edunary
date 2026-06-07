import { memo } from "react";
import { Box, Typography, Button, Skeleton, Avatar } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { useNavigate } from "react-router-dom";
import { formatNumberK } from "../../../utils/helpers";

function TopCoursesTable({ data, isLoading }) {
    const navigate = useNavigate();
    const courses = data?.topCourses ?? [];

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                borderRadius: "16px",
                p: 3,
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                    Popular Courses
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    Top courses by total students
                </Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "8px" }} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="50%" />
                            </Box>
                            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: "12px" }} />
                        </Box>
                    ))}
                </Box>
            ) : courses.length === 0 ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ color: "text.disabled", fontSize: "0.85rem" }}>
                        No popular courses found
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
                    {courses.map((course) => (
                        <Box
                            key={course.courseId}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                cursor: "pointer",
                                transition: "opacity 0.15s ease",
                                "&:hover": { opacity: 0.8 },
                            }}
                            onClick={() => navigate(`/admin/course/${course.courseId}`)}
                        >
                            <Avatar
                                src={course.thumbnail}
                                variant="rounded"
                                sx={{ width: 44, height: 44, borderRadius: "8px", bgcolor: "background.alt" }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        color: "text.primary",
                                        lineHeight: 1.3,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {course.title}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    bgcolor: "rgba(0, 0, 0, 0.04)",
                                    borderRadius: "16px",
                                    px: 1.5,
                                    py: 0.5,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: "text.secondary",
                                    }}
                                >
                                    {formatNumberK(course.enrollments)} Students
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                    onClick={() => navigate("/admin/course/list")}
                    sx={{ color: "brand.main", fontSize: "0.78rem", fontWeight: 600, "&:hover": { bgcolor: "background.muted" } }}
                >
                    View Course Management
                </Button>
            </Box>
        </Box>
    );
}

export default memo(TopCoursesTable);
