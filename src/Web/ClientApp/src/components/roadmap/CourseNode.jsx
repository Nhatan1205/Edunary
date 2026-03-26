import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockCourse = {
    id: 1,
    title: "Data Structure and Algorithm",
    description:
        "Master the fundamentals of efficient programming through core...",
    duration: "40h",
    rating: 4.8,
    status: "COMPLETED", // "COMPLETED" | "IN_PROGRESS" | null
    thumbnail: null, // set to an image URL to show a real thumbnail
};

// ─── Thumbnail placeholder (dark matrix-like background) ─────────────────────
function CourseThumbnail({ src, status }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                aspectRatio: "16/9",
                background: src
                    ? "transparent"
                    : "linear-gradient(135deg, #1a2e2b 0%, #0d1f1d 60%, #112925 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Decorative binary/matrix text overlay */}
            {!src && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        color: "rgba(63, 204, 178, 0.18)",
                        fontSize: "0.45rem",
                        lineHeight: 1.4,
                        letterSpacing: "0.05em",
                        overflow: "hidden",
                        userSelect: "none",
                        p: 1,
                        fontFamily: "monospace",
                    }}
                >
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i}>
                            {Array.from({ length: 60 })
                                .map(() => (Math.random() > 0.5 ? "1" : "0"))
                                .join(" ")}
                        </div>
                    ))}
                </Box>
            )}

            {/* Real thumbnail */}
            {src && (
                <Box
                    component="img"
                    src={src}
                    alt="course thumbnail"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            )}

            {/* Status badge */}
            {status && (
                <Chip
                    label={status}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        bgcolor:
                            status === "COMPLETED"
                                ? "secondaryBrand.main"
                                : "brand.main",
                        color: "text.inverse",
                        borderRadius: "6px",
                        height: 24,
                        px: 0.5,
                    }}
                />
            )}
        </Box>
    );
}

// ─── Main Card ───────────────────────────────────────────────────────────────
export default function CourseNode({ course = mockCourse }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: 260,
                borderRadius: "16px",
                bgcolor: "background.paper",
                boxShadow: "0 4px 24px 0 rgba(31,60,57,0.10)",
                p: 1.5,
                pb: 1.8,
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
                border: `1px solid ${theme.palette.divider}`,
                transition: "box-shadow 0.2s",
                "&:hover": {
                    boxShadow: "0 8px 32px 0 rgba(31,60,57,0.16)",
                },
            }}
        >
            {/* Thumbnail */}
            <CourseThumbnail src={course.thumbnail} status={course.status} />

            {/* Text body */}
            <Box sx={{ px: 0.5 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        lineHeight: 1.35,
                        color: "text.primary",
                        mb: 0.6,
                    }}
                >
                    {course.title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "text.tertiary",
                        fontSize: "0.82rem",
                        lineHeight: 1.5,
                    }}
                >
                    {course.description}
                </Typography>
            </Box>

            {/* Divider line */}
            <Box sx={{ height: "1px", bgcolor: "divider", mx: 0.5 }} />

            {/* Footer: duration + rating */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 0.5,
                }}
            >
                {/* Duration */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <AccessTimeIcon
                        sx={{ fontSize: "0.95rem", color: "text.tertiary" }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", color: "text.secondary", fontWeight: 500 }}
                    >
                        {course.duration} duration
                    </Typography>
                </Box>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <StarIcon sx={{ fontSize: "1rem", color: "#F5A623" }} />
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary" }}
                    >
                        {course.rating.toFixed(1)}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
