
import {
    Drawer, Box, Typography, Avatar, Divider,
    IconButton, Button, LinearProgress, Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";
import { formatShortDate, formatTimeAgo } from "../../../../../utils/helpers";
import useGetInstructorStudentDetail from "../../../../../hooks/enrollment-hooks/useGetInstructorStudentDetail";
import { useNavigate } from "react-router";
import useCreateConversation from "../../../../../hooks/dm-hooks/useCreateConversation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function progressColor(pct) {
    if (pct >= 80) return "#22C55E";
    if (pct >= 40) return "#3B82F6";
    return "#F59E0B";
}

// ── Course progress card (compact) ────────────────────────────────────────────
function CourseProgressCard({ course }) {
    const progressPercent = course.totalItems > 0
        ? Math.round((course.completedItems / course.totalItems) * 100)
        : 0;
    const color = progressColor(progressPercent);
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1.5,
                borderBottom: "1px solid #F3F4F6",
                "&:last-child": { borderBottom: "none" },
            }}
        >
            {/* Course image / placeholder */}
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "8px",
                    bgcolor: course.courseImageUrl ? "transparent" : "#F3F4F6",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {course.courseImageUrl ? (
                    <Box
                        component="img"
                        src={course.courseImageUrl}
                        alt={course.courseTitle}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <SchoolIcon sx={{ fontSize: 22, color: "grey.400" }} />
                )}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "0.82rem", fontWeight: 600, color: "text.primary",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        mb: 0.25,
                    }}
                >
                    {course.courseTitle}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.75 }}>
                    Enrolled {formatShortDate(course.enrolledDate)}
                </Typography>

                {/* Progress bar */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: "#F3F4F6", overflow: "hidden" }}>
                        <Box
                            sx={{
                                height: "100%",
                                width: `${progressPercent}%`,
                                bgcolor: color,
                                borderRadius: 3,
                                transition: "width 0.4s ease",
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color, minWidth: 30, textAlign: "right" }}>
                        {progressPercent}%
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.4 }}>
                    {course.completedItems} / {course.totalItems} lessons
                </Typography>
            </Box>
        </Box>
    );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
function StudentDetailDrawer({ open, onClose, studentId }) {
    const { data: detail, isLoading } = useGetInstructorStudentDetail(studentId);
    const createConversation = useCreateConversation();
    const navigate = useNavigate();

    const handleMessageClick = async () => {
        if (!detail?.studentId) return;
        try {
            const res = await createConversation.mutateAsync(detail.studentId);
            if (res && res.result > 0) {
                onClose();
                navigate(`/instructor/communication/messages?id=${res.result}`);
            }
        } catch (err) {
            // Handled by mutation toast
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 420 },
                    boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
                },
            }}
        >
            {isLoading ? (
                <Box sx={{ p: 3 }}>
                    <Skeleton height={56} />
                    <Skeleton height={200} sx={{ mt: 2 }} />
                </Box>
            ) : !detail ? (
                <Box sx={{ p: 3 }}>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                        No data available.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* ── Header ── */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 2.5,
                            py: 1.5,
                            borderBottom: "1px solid #F3F4F6",
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                            Student Details
                        </Typography>
                        <IconButton size="small" onClick={onClose} sx={{ borderRadius: "8px", color: "grey.500" }}>
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* ── Scrollable body ── */}
                    <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
                        {/* Avatar + name + status */}
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, mb: 3 }}>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "50%",
                                    border: "2.5px solid #E5E7EB",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    bgcolor: "brand.lighter",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {detail.avatar || defaultAvatar ? (
                                    <Box
                                        component="img"
                                        src={detail.avatar || defaultAvatar}
                                        alt={detail.fullName}
                                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : null}
                            </Box>

                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "text.primary" }}>
                                    {detail.fullName}
                                </Typography>
                                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.25 }}>
                                    {detail.email}
                                </Typography>
                            </Box>

                            {/* Action buttons */}
                            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                                <Button
                                    size="small"
                                    endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => { onClose(); window.open(`/profile/${detail.studentId}`, "_blank"); }}
                                    sx={{
                                        borderRadius: "8px",
                                        border: "1.5px solid",
                                        borderColor: "grey.300",
                                        color: "text.secondary",
                                        fontSize: "0.8rem",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" },
                                    }}
                                >
                                    View Profile
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<MailOutlineIcon sx={{ fontSize: 15 }} />}
                                    onClick={handleMessageClick}
                                    disabled={createConversation.isPending}
                                    sx={{
                                        borderRadius: "8px",
                                        bgcolor: "brand.main",
                                        color: "#fff",
                                        fontSize: "0.8rem",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        px: 2,
                                        boxShadow: "none",
                                        "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
                                    }}
                                >
                                    {createConversation.isPending ? "Connecting..." : "Message"}
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        {/* Summary meta */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                            {[
                                { icon: <SchoolIcon sx={{ fontSize: 15 }} />, label: "Courses Enrolled", value: detail.courses?.length ?? 0 },
                                { icon: <AccessTimeIcon sx={{ fontSize: 15 }} />, label: "Last Active", value: formatTimeAgo(detail.lastActiveDate) },
                            ].map((meta) => (
                                <Box key={meta.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>{meta.icon}</Box>
                                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", minWidth: 110 }}>{meta.label}</Typography>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary" }}>{meta.value}</Typography>
                                </Box>
                            ))}
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        {/* Course progress list */}
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 1.5 }}>
                            Course Progress
                        </Typography>
                        <Box>
                            {(detail.courses ?? []).map((course) => (
                                <CourseProgressCard key={course.courseId} course={course} />
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}

export default StudentDetailDrawer;
