import { memo } from "react";
import { Box, Typography, Skeleton, Avatar } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

function PopularInstructors({ data, isLoading }) {
    const instructors = data?.popularInstructors ?? [];

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
            {/* Title */}
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "text.primary" }}>
                    Popular Instructors
                </Typography>
            </Box>

            {/* Table Headers */}
            <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", pb: 1, mb: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Instructors
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Courses
                </Typography>
            </Box>

            {/* List */}
            {isLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[...Array(4)].map((_, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" height={12} />
                            </Box>
                            <Skeleton variant="text" width={20} />
                        </Box>
                    ))}
                </Box>
            ) : instructors.length === 0 ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ color: "text.disabled", fontSize: "0.85rem" }}>
                        No instructor data yet
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {instructors.map((instructor) => (
                        <Box
                            key={instructor.instructorId}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 0.5,
                            }}
                        >
                            <Avatar
                                src={instructor.avatar}
                                sx={{ width: 40, height: 40, bgcolor: "background.alt" }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        color: "text.primary",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {instructor.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: "0.72rem",
                                        color: "text.secondary",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        mt: 0.25,
                                    }}
                                >
                                    {instructor.headline || "Instructor"}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}>
                                    {instructor.coursesCount}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.25 }}>
                                    <StarIcon sx={{ fontSize: 11, color: "warning.main" }} />
                                    <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", fontWeight: 500 }}>
                                        {instructor.avgRating.toFixed(1)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default memo(PopularInstructors);
