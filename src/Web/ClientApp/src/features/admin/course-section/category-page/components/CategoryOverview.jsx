import { Box, Typography, Skeleton } from "@mui/material";

import useAdminGetCategoryStats from "../../../../../hooks/category-hooks/useAdminGetCategoryStats";

import imgTotalCategories from "../../../../../assets/images/card_total_categories.png";
import imgActiveCategories from "../../../../../assets/images/card_active_categories.png";
import imgEmptyCategories from "../../../../../assets/images/card_empty_categories.png";
import imgAvgCourses from "../../../../../assets/images/card_avg_courses.png";

const CARD_CONFIGS = [
    {
        key: "totalCategories",
        label: "Total Categories",
        gradient: "linear-gradient(135deg, #d4f5e2 0%, #a7f3d0 100%)",
        image: imgTotalCategories,
    },
    {
        key: "activeCategories",
        label: "Active Categories",
        gradient: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
        image: imgActiveCategories,
    },
    {
        key: "emptyCategories",
        label: "Empty Categories",
        gradient: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
        image: imgEmptyCategories,
    },
    {
        key: "avgCoursesPerCategory",
        label: "Avg Courses",
        gradient: "linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)",
        image: imgAvgCourses,
    },
];

// ── StatCard ───────────────────────────────────────────────────────────
function StatCard({ config, value, isLoading }) {
    const displayValue =
        typeof value === "number" && config.key === "avgCoursesPerCategory"
            ? value.toFixed(1)
            : value;

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: "16px",
                background: config.gradient,
                p: "22px 20px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 170,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "transform 0.18s, box-shadow 0.18s",
            }}
        >
            <Typography sx={{ fontSize: "1rem", color: "text.secondary", fontWeight: 500 }}>
                {config.label}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: 1 }}>
                {isLoading ? (
                    <Skeleton variant="text" width={60} height={52} />
                ) : (
                    <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                        {displayValue ?? "—"}
                    </Typography>
                )}
                <Box
                    component="img"
                    src={config.image}
                    alt={config.label}
                    sx={{ width: 64, height: 64, objectFit: "contain", opacity: 0.92, flexShrink: 0 }}
                />
            </Box>
        </Box>
    );
}

// ── CategoryOverview (exported) ────────────────────────────────────────
function CategoryOverview() {
    const { data, isLoading } = useAdminGetCategoryStats();

    const stats = {
        totalCategories: data?.totalCategories ?? 0,
        activeCategories: data?.activeCategories ?? 0,
        emptyCategories: data?.emptyCategories ?? 0,
        avgCoursesPerCategory: data?.avgCoursesPerCategory ?? 0,
    };

    return (
        <Box sx={{ mb: 3 }}>
            {/* Stat cards */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                {CARD_CONFIGS.map((cfg) => (
                    <StatCard key={cfg.key} config={cfg} value={stats[cfg.key]} isLoading={isLoading} />
                ))}
            </Box>
        </Box>
    );
}

export default CategoryOverview;
