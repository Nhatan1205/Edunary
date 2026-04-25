import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "reactstrap";
import {
    Box, Typography, Avatar, Chip, Button, Card, Divider,
    Skeleton, IconButton, Tooltip, LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LinkIcon from "@mui/icons-material/Link";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

import useAdminRestrictUser from "../../../../hooks/user-hooks/useAdminRestrictUser";
import useAdminUnbanUser from "../../../../hooks/user-hooks/useAdminUnbanUser";
import useAdminChangeUserRole from "../../../../hooks/user-hooks/useAdminChangeUserRole";
import useAdminGetUserDetail from "../../../../hooks/user-hooks/useAdminGetUserDetail";
import useGetActivityLogs from "../../../../hooks/activity-log-hooks/useGetActivityLogs";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import ChangeRoleDialog from "../user-page/components/ChangeRoleDialog";
import RestrictUserDialog from "../components/RestrictUserDialog";

// ── Utils ──────────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtRelative = (d) => {
    if (!d) return "Never";
    const sec = Math.floor((Date.now() - new Date(d)) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    const days = Math.floor(sec / 86400);
    if (days < 30) return `${days}d ago`;
    return fmtDate(d);
};
const fmtMoney = (v) => v ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v) : "$0";
/** Strip HTML tags and return plain text — used for short previews of WYSIWYG content. */
const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const cardSx = {
    borderRadius: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
    bgcolor: "background.paper",
    overflow: "hidden",
    height: "100%",
};

const statusMap = {
    Active:    { bg: "success.lighter",  color: "success.darker" },
    Inactive:  { bg: "grey.300",          color: "text.secondary" },
    Suspended: { bg: "warning.lighter",  color: "warning.dark" },
    Banned:    { bg: "error.lighter",    color: "error.dark" },
};

const roleMap = {
    Administrator: { bg: "secondaryBrand.lighter", color: "secondaryBrand.dark" },
    User:          { bg: "brand.lighter",           color: "brand.dark" },
};

const courseStatusMap = {
    Published: { bg: "success.lighter", color: "success.dark" },
    Draft: { bg: "grey.200", color: "text.secondary" },
    PendingReview: { bg: "warning.lighter", color: "warning.dark" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const StatBubble = ({ value, label, divider }) => (
    <Box sx={{ textAlign: "center", px: 3, py: 0.5, ...(divider && { borderRight: "1px solid #F3F4F6" }) }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1, color: "text.primary" }}>
            {value ?? "—"}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "brand.main", fontWeight: 700, mt: 0.4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
        </Typography>
    </Box>
);

const MetricCard = ({ icon, value, label, accent }) => (
    <Box sx={{ p: 1.75, borderRadius: "12px", border: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: accent }}>
            {icon}
        </Box>
        <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.1, color: "text.primary" }}>{value}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{label}</Typography>
        </Box>
    </Box>
);

const InfoRow = ({ icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, py: 1, borderBottom: "1px solid #F9FAFB" }}>
        <Box sx={{ color: "brand.main", mt: 0.1, flexShrink: 0, fontSize: 18, display: "flex" }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "text.disabled", display: "block", lineHeight: 1 }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", mt: 0.2, wordBreak: "break-all" }}>{value || "—"}</Typography>
        </Box>
    </Box>
);

const SectionTitle = ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary", letterSpacing: "0.01em" }}>
        {children}
    </Typography>
);


const PageSkeleton = () => (
    <Box>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: "16px", mb: 2 }} />
        <Row className="g-2 mb-2">
            <Col md={8}><Skeleton variant="rounded" height={180} sx={{ borderRadius: "16px" }} /></Col>
            <Col md={4}><Skeleton variant="rounded" height={180} sx={{ borderRadius: "16px" }} /></Col>
        </Row>
        <Row className="g-2 mb-2">
            <Col md={4}><Skeleton variant="rounded" height={160} sx={{ borderRadius: "16px" }} /></Col>
            <Col md={8}><Skeleton variant="rounded" height={160} sx={{ borderRadius: "16px" }} /></Col>
        </Row>
        <Row className="g-2">
            <Col md={7}><Skeleton variant="rounded" height={260} sx={{ borderRadius: "16px" }} /></Col>
            <Col md={5}><Skeleton variant="rounded" height={260} sx={{ borderRadius: "16px" }} /></Col>
        </Row>
    </Box>
);

export default function UserDetailPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useAdminGetUserDetail(userId);

    // Fetch 5 most recent activity logs for this user
    const TIMELINE_DOT_COLORS = ["success.main", "info.main", "warning.main", "error.main", "secondaryBrand.main"];
    const { data: logsData, isLoading: logsLoading } = useGetActivityLogs({
        userId,
        pageNumber: 1,
        pageSize: 5,
        sortOrder: "newest",
    });
    const timelineLogs = logsData?.items ?? [];

    const { mutate: restrictUser, isPending: isRestricting } = useAdminRestrictUser();
    const { mutate: unbanUser } = useAdminUnbanUser();
    const { mutate: changeRole, isPending: isChangingRole } = useAdminChangeUserRole();

    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", action: null });
    const [restrictDialogOpen, setRestrictDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [descDialogOpen, setDescDialogOpen] = useState(false);

    const openConfirm = (title, message, action) => setConfirmDialog({ open: true, title, message, action });
    const closeConfirm = () => setConfirmDialog((p) => ({ ...p, open: false, action: null }));
    const handleConfirm = () => { confirmDialog.action?.(); closeConfirm(); };

    const isSanctioned = ["Banned", "Suspended"].includes(data?.status);
    const sChip = statusMap[data?.status] ?? statusMap.Active;
    const initials = data?.fullName?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    const links = (() => { try { return JSON.parse(data?.links || "[]"); } catch { return data?.links ? [data.links] : []; } })();

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/user/list")}
                sx={{ mb: 2.5, color: "text.secondary", fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: "background.muted" } }}>
                Back to Users
            </Button>

            {isLoading && <PageSkeleton />}

            {isError && !isLoading && (
                <Box sx={{ textAlign: "center", py: 10 }}>
                    <Typography sx={{ color: "error.main", fontWeight: 700, fontSize: "1.1rem" }}>
                        Failed to load user data.
                    </Typography>
                    <Button sx={{ mt: 2, textTransform: "none", color: "brand.main" }} onClick={() => navigate("/admin/user/list")}>
                        Go back to Users list
                    </Button>
                </Box>
            )}

            {!isLoading && !isError && data && (<>
                <Card sx={{ ...cardSx, mb: 2.5, height: "auto" }}>
                    <Box sx={{ height: 220, background: "linear-gradient(135deg, #004B50 0%, #007867 45%, #00A76F 100%)", position: "relative", overflow: "hidden" }}>
                        <Box sx={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
                        <Box sx={{ position: "absolute", bottom: -60, right: 100, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
                        <Box sx={{ position: "absolute", top: 20, left: -30, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)" }} />
                    </Box>

                    <Box sx={{ px: 3, pb: 3 }}>
                        {/* Avatar row */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box sx={{ mt: "-52px", position: "relative", flexShrink: 0 }}>
                                <Avatar src={data.avatar || undefined} sx={{ width: 100, height: 100, fontSize: "2rem", fontWeight: 700, border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.14)", bgcolor: "brand.main", color: "#fff" }}>
                                    {!data.avatar && initials}
                                </Avatar>
                                <Box sx={{ position: "absolute", bottom: 6, right: 6, width: 16, height: 16, borderRadius: "50%", bgcolor: data.isOnline ? "success.main" : "grey.400", border: "3px solid #fff" }} />
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                {isSanctioned ? (
                                    <Button size="small" variant="outlined" startIcon={<LockOpenIcon fontSize="small" />}
                                        onClick={() => openConfirm("Lift Restriction", `Restore "${data.fullName}"'s account? They will be able to log in again.`, () => unbanUser({ userId }))}
                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: "warning.main", color: "warning.dark", "&:hover": { bgcolor: "warning.lighter" } }}>
                                        Lift Restriction
                                    </Button>
                                ) : (
                                    <Button size="small" variant="outlined" startIcon={<BlockIcon fontSize="small" />}
                                        onClick={() => setRestrictDialogOpen(true)}
                                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: "error.main", color: "error.dark", "&:hover": { bgcolor: "error.lighter" } }}>
                                        Restrict
                                    </Button>
                                )}
                                <Button size="small" variant="outlined" startIcon={<ManageAccountsIcon fontSize="small" />}
                                    onClick={() => setRoleDialogOpen(true)}
                                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", borderColor: "brand.main", color: "brand.dark", "&:hover": { bgcolor: "brand.lighter" } }}>
                                    Change Role
                                </Button>
                            </Box>
                        </Box>

                        {/* Name + Headline + Badges */}
                        <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "text.primary" }}>{data.fullName}</Typography>
                                <Chip label={data.status} size="small" sx={{ bgcolor: sChip.bg, color: sChip.color, fontWeight: 700, fontSize: "0.7rem", height: 22, borderRadius: "6px" }} />
                                {(() => {
                                    const role = data.roles?.[0] ?? "User";
                                    const rStyle = roleMap[role] ?? { bg: "grey.200", color: "text.secondary" };
                                    return <Chip label={role} size="small" sx={{ bgcolor: rStyle.bg, color: rStyle.color, fontWeight: 700, fontSize: "0.7rem", height: 22, borderRadius: "6px" }} />;
                                })()}
                                <Chip
                                    label={data.isOnline ? "● Online" : "● Offline"}
                                    size="small"
                                    sx={{
                                        bgcolor: data.isOnline ? "success.lighter" : "grey.300",
                                        color: data.isOnline ? "success.darker" : "text.secondary",
                                        fontWeight: 700, fontSize: "0.7rem", height: 22, borderRadius: "6px",
                                    }}
                                />
                            </Box>
                            {data.headline && <Typography sx={{ color: "text.secondary", fontSize: "0.875rem", mb: 1 }}>{data.headline}</Typography>}
                            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                                {data.email && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", fontSize: "0.8rem" }}><EmailOutlinedIcon sx={{ fontSize: 15 }} />{data.email}</Box>}
                                {data.phoneNumber && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", fontSize: "0.8rem" }}><PhoneOutlinedIcon sx={{ fontSize: 15 }} />{data.phoneNumber}</Box>}
                            </Box>
                        </Box>

                        {/* Stat bubbles */}
                        <Box sx={{ display: "flex", mt: 2.5, pt: 2, borderTop: "1px solid #F3F4F6" }}>
                            <StatBubble value={data.stats?.totalLearners ?? data.stats?.createdCourseCount ?? 0} label="Total Learners" divider />
                            <StatBubble value={data.stats?.avgRating ? data.stats.avgRating.toFixed(1) : "—"} label="Avg Rating" />
                        </Box>
                    </Box>
                </Card>

                <Row className="g-3 mb-3">
                    <Col md={4}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5 }}>
                                <SectionTitle>Account Info</SectionTitle>
                                <InfoRow icon={<CalendarTodayOutlinedIcon fontSize="small" />} label="Joined" value={fmtDate(data.createdAt)} />
                                <InfoRow icon={<AccessTimeOutlinedIcon fontSize="small" />} label="Last Login" value={fmtRelative(data.lastLoginTime)} />
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, py: 1 }}>
                                    <Box sx={{ color: "brand.main", mt: 0.1, fontSize: 18, display: "flex", flexShrink: 0 }}>🆔</Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", lineHeight: 1 }}>User ID</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.72rem", wordBreak: "break-all" }}>
                                                {data.id?.slice(0, 20)}…
                                            </Typography>
                                            <Tooltip title="Copy ID">
                                                <IconButton size="small" onClick={() => { navigator.clipboard.writeText(data.id); toast.success("Copied!"); }}>
                                                    <ContentCopyIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Col>
                    <Col md={8}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5 }}>
                                <SectionTitle>Activity Overview</SectionTitle>
                                <Row className="g-2">
                                    <Col xs={6}><MetricCard icon={<AutoStoriesOutlinedIcon />} value={data.stats?.enrolledCourseCount ?? 0} label="Courses Enrolled" accent="brand.main" /></Col>
                                    <Col xs={6}><MetricCard icon={<SchoolOutlinedIcon />} value={data.stats?.createdCourseCount ?? 0} label="Courses Created" accent="secondaryBrand.main" /></Col>
                                    <Col xs={6}><MetricCard icon={<AttachMoneyIcon />} value={fmtMoney(data.stats?.totalSpent)} label="Total Spent" accent="warning.dark" /></Col>
                                    <Col xs={6}><MetricCard icon={<TrendingUpIcon />} value={fmtMoney(data.stats?.totalEarned)} label="Total Earned" accent="success.dark" /></Col>
                                </Row>
                            </Box>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-3 mb-3">
                    <Col md={8}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5, display: "flex", gap: 3, height: "100%" }}>
                                {/* About column */}
                                <Box sx={{ flex: "0 0 55%", minWidth: 0, display: "flex", flexDirection: "column" }}>
                                    <SectionTitle>About</SectionTitle>
                                    {data.description ? (
                                        <>
                                            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                                                {(() => {
                                                    const plain = stripHtml(DOMPurify.sanitize(data.description));
                                                    return plain.length > 200 ? plain.slice(0, 200) + "…" : plain;
                                                })()}
                                            </Typography>
                                            {stripHtml(DOMPurify.sanitize(data.description)).length > 200 && (
                                                <Button size="small" onClick={() => setDescDialogOpen(true)}
                                                    sx={{ mt: 1, alignSelf: "flex-start", textTransform: "none", fontWeight: 600, color: "brand.main", p: 0, fontSize: "0.78rem", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
                                                    View more →
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>No bio provided.</Typography>
                                    )}
                                </Box>

                                {/* Divider */}
                                <Divider orientation="vertical" flexItem sx={{ borderColor: "#F3F4F6" }} />

                                {/* Links column */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <SectionTitle>Links</SectionTitle>
                                    {links.length > 0 ? (
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                            {links.map((link, i) => (
                                                <Box key={i} component="a"
                                                    href={link.startsWith("http") ? link : `https://${link}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.9, borderRadius: "8px", textDecoration: "none", border: "1px solid #F3F4F6", "&:hover": { bgcolor: "grey.100", borderColor: "grey.300" }, transition: "all 0.15s" }}
                                                >
                                                    <LinkIcon sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
                                                    <Typography sx={{ fontSize: "0.8rem", color: "text.primary", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {link}
                                                    </Typography>
                                                    <OpenInNewIcon sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>No links provided.</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Card>
                    </Col>

                    {/* ── Activity Timeline card ── */}
                    <Col md={4}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5 }}>
                                <SectionTitle>Activity Timeline</SectionTitle>
                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                    {logsLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <Box key={i} sx={{ display: "flex", gap: 1.5, pb: i < 4 ? 1.5 : 0 }}>
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "grey.200", mt: 0.4 }} />
                                                    {i < 4 && <Box sx={{ width: "2px", flex: 1, bgcolor: "#F3F4F6", my: 0.5, minHeight: 20 }} />}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton variant="text" width="80%" height={16} />
                                                    <Skeleton variant="text" width="50%" height={12} />
                                                </Box>
                                            </Box>
                                        ))
                                    ) : timelineLogs.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", py: 1 }}>No activity yet.</Typography>
                                    ) : (
                                        timelineLogs.map((log, i, arr) => (
                                            <Box key={log.id} sx={{ display: "flex", gap: 1.5 }}>
                                                {/* Dot + line */}
                                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TIMELINE_DOT_COLORS[i % TIMELINE_DOT_COLORS.length], mt: 0.4, flexShrink: 0 }} />
                                                    {i < arr.length - 1 && <Box sx={{ width: "2px", flex: 1, bgcolor: "#F3F4F6", my: 0.5 }} />}
                                                </Box>
                                                {/* Content */}
                                                <Box sx={{ pb: i < arr.length - 1 ? 1.5 : 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.82rem", lineHeight: 1.3 }}>
                                                        {log.description || "—"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        {log.created ? new Date(log.created).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Box>
                                <Box sx={{ mt: 2, textAlign: "center" }}>
                                    <Button
                                        size="small"
                                        onClick={() => navigate(`/admin/user/${userId}/activity-logs`)}
                                        sx={{ textTransform: "none", color: "brand.main", fontWeight: 600, fontSize: "0.78rem", "&:hover": { bgcolor: "background.muted" } }}
                                    >
                                        View more
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-3">
                    <Col md={7}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5 }}>
                                <SectionTitle>Recent Enrolled Courses</SectionTitle>
                                {!data.enrolledCourses?.length ? (
                                    <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", py: 2, textAlign: "center" }}>No enrolled courses.</Typography>
                                ) : (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                        {data.enrolledCourses.map((c) => {
                                            const pct = Math.round(c.progressPercentage ?? 0);
                                            const barColor = pct === 100 ? "success.main" : "warning.main";
                                            return (
                                                <Box key={c.courseId} sx={{ display: "flex", gap: 1.5 }}>
                                                    {/* Thumbnail */}
                                                    <Box sx={{ width: 72, height: 52, borderRadius: "8px", flexShrink: 0, overflow: "hidden", bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        {c.courseImage
                                                            ? <Box component="img" src={c.courseImage} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            : <AutoStoriesOutlinedIcon sx={{ color: "grey.400", fontSize: 22 }} />
                                                        }
                                                    </Box>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box
                                                            component="a"
                                                            href={`/course/${c.courseId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                display: "flex", alignItems: "flex-start", gap: 0.5, mb: 0.3,
                                                                textDecoration: "none",
                                                                "&:hover .course-title": { textDecoration: "underline", color: "brand.dark" },
                                                            }}
                                                        >
                                                            <Typography className="course-title" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary", lineHeight: 1.3, flex: 1, minWidth: 0, transition: "color 0.15s" }}>
                                                                {c.courseTitle}
                                                            </Typography>
                                                            <OpenInNewIcon sx={{ fontSize: 13, color: "text.disabled", mt: 0.2, flexShrink: 0 }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.8 }}>Lessons: {pct < 100 ? `${Math.round(pct / 8.33)}/12` : "12/12"}</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Box sx={{ flex: 1, height: 6, borderRadius: "3px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                                                                <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: barColor, borderRadius: "3px", transition: "width 0.5s ease" }} />
                                                            </Box>
                                                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", flexShrink: 0, minWidth: 36, textAlign: "right" }}>{pct}%</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                                {!!data.enrolledCourses?.length && (
                                    <Box sx={{ mt: 2, textAlign: "center" }}>
                                        <Button size="small" sx={{ textTransform: "none", color: "brand.main", fontWeight: 600, fontSize: "0.78rem", "&:hover": { bgcolor: "background.muted" } }}>
                                            View more
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Col>
                    <Col md={5}>
                        <Card sx={{ ...cardSx }}>
                            <Box sx={{ p: 2.5 }}>
                                <SectionTitle>Owned Courses</SectionTitle>
                                {!data.createdCourses?.length ? (
                                    <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", py: 2, textAlign: "center" }}>No owned courses.</Typography>
                                ) : (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                        {data.createdCourses.map((c) => {
                                            const cs = courseStatusMap[c.status] ?? courseStatusMap.Draft;
                                            return (
                                                <Box key={c.courseId} sx={{ display: "flex", gap: 1.5 }}>
                                                    {/* Thumbnail */}
                                                    <Box sx={{ width: 72, height: 52, borderRadius: "8px", flexShrink: 0, overflow: "hidden", bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        {c.courseImage
                                                            ? <Box component="img" src={c.courseImage} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            : <SchoolOutlinedIcon sx={{ color: "grey.400", fontSize: 22 }} />
                                                        }
                                                    </Box>
                                                    {/* Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        {/* Title row — entire row is clickable */}
                                                        <Box
                                                            component="a"
                                                            href={`/course/${c.courseId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                display: "flex", alignItems: "flex-start", gap: 0.5, mb: 0.3,
                                                                textDecoration: "none",
                                                                "&:hover .course-title": { textDecoration: "underline", color: "brand.dark" },
                                                            }}
                                                        >
                                                            <Typography className="course-title" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary", lineHeight: 1.3, flex: 1, minWidth: 0, transition: "color 0.15s" }}>
                                                                {c.courseTitle}
                                                            </Typography>
                                                            <OpenInNewIcon sx={{ fontSize: 13, color: "text.disabled", mt: 0.2, flexShrink: 0 }} />
                                                        </Box>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                            <Chip label={c.status} size="small" sx={{ bgcolor: cs.bg, color: cs.color, fontWeight: 700, fontSize: "0.6rem", height: 18 }} />
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, color: "text.secondary", fontSize: "0.72rem" }}>
                                                                <PeopleOutlinedIcon sx={{ fontSize: 12 }} />{c.totalStudents ?? 0}
                                                            </Box>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, color: "warning.dark", fontSize: "0.72rem" }}>
                                                                <StarRoundedIcon sx={{ fontSize: 12 }} />{c.ratings ? c.ratings.toFixed(1) : "—"}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                                {!!data.createdCourses?.length && (
                                    <Box sx={{ mt: 2, textAlign: "center" }}>
                                        <Button size="small" sx={{ textTransform: "none", color: "brand.main", fontWeight: 600, fontSize: "0.78rem", "&:hover": { bgcolor: "background.muted" } }}>
                                            View more
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Col>
                </Row>

                {/* ── Description Dialog ── */}
                <Dialog open={descDialogOpen} onClose={() => setDescDialogOpen(false)} maxWidth="md" fullWidth
                    PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
                    <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>About</DialogTitle>
                    <Divider />
                    <DialogContent sx={{ pt: 2, overflowX: "hidden" }}>
                        <Box
                            sx={{
                                color: "text.secondary",
                                lineHeight: 1.8,
                                fontSize: "0.875rem",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                "& *": { maxWidth: "100%" },
                                "& img": { height: "auto" },
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description) }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => setDescDialogOpen(false)}
                            sx={{ textTransform: "none", fontWeight: 600, bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, borderRadius: "10px", px: 2.5 }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <ConfirmDialog
                    open={confirmDialog.open}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    onClose={closeConfirm}
                    onConfirm={handleConfirm}
                />
                <RestrictUserDialog
                    open={restrictDialogOpen}
                    onClose={() => setRestrictDialogOpen(false)}
                    user={{ fullName: data?.fullName }}
                    isSaving={isRestricting}
                    onConfirm={({ durationDays }) => {
                        restrictUser({ userId, durationDays, fullName: data?.fullName }, {
                            onSuccess: () => setRestrictDialogOpen(false),
                        });
                    }}
                />
                <ChangeRoleDialog
                    open={roleDialogOpen}
                    onClose={() => setRoleDialogOpen(false)}
                    isSaving={isChangingRole}
                    user={{ ...data, roles: data?.roles }}
                    onSave={({ newRole }) => changeRole(
                        { userId, fullName: data?.fullName, newRole },
                        { onSuccess: () => setRoleDialogOpen(false) }
                    )}
                />
            </>)}
        </Box>
    );
}
