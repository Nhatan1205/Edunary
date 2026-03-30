import React from "react";
import { Box, Typography } from "@mui/material";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import StarIcon from "@mui/icons-material/Star";
import DefaultImage from "../../assets/images/default.jpg";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const mockCourse = {
    id: 1,
    title: "Data Structure and Algorithm",
    subtitle: "Master the fundamentals of efficient programming through core...",
    totalStudents: 0,
    ratings: 4.8,
    status: 0,
    imageUrl: null,
};

function CourseThumbnail({ src }) {
    return (
        <Box
            component="img"
            src={src || DefaultImage}
            alt="course thumbnail"
            sx={{
                width: "100%",
                borderRadius: "12px",
                aspectRatio: "16/9",
                objectFit: "cover",
                display: "block",
            }}
        />
    );
}

export default function CourseNode({ course = mockCourse }) {
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
                border: "1px solid",
                borderColor: "divider",
                transition: "box-shadow 0.2s",
                "&:hover": {
                    boxShadow: "0 8px 32px 0 rgba(31,60,57,0.16)",
                },
            }}
        >
            {/* Thumbnail */}
            <CourseThumbnail src={course.imageUrl} />

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
                    {course.subtitle}
                </Typography>
            </Box>

            {/* Divider line */}
            <Box sx={{ height: "1px", bgcolor: "divider", mx: 0.5 }} />

            {/* Footer: students + rating */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 0.5,
                }}
            >
                {/* Total Students */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <PeopleOutlineIcon
                        sx={{ fontSize: "0.95rem", color: "text.tertiary" }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", color: "text.secondary", fontWeight: 500 }}
                    >
                        {(course.totalStudents ?? 0).toLocaleString()}
                    </Typography>
                </Box>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <StarIcon sx={{ fontSize: "1rem", color: "#F5A623" }} />
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary" }}
                    >
                        {course.ratings?.toFixed(1) ?? "—"}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
