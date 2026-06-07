import { memo } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
    {
        key: "approvals",
        icon: RateReviewOutlinedIcon,
        label: "Course Approvals",
        descKey: "pendingApprovals",
        descFn: (n) => `${n} course${n !== 1 ? "s" : ""} pending review`,
        actionLabel: "Review Now",
        to: "/admin/course/approvals",
        color: "secondaryBrand.main",
        bg: "secondaryBrand.lighter",
        threshold: 0,
    },
    {
        key: "withdrawals",
        icon: AccountBalanceWalletOutlinedIcon,
        label: "Withdrawal Requests",
        descKey: "pendingWithdrawals",
        descFn: (n) => `${n} request${n !== 1 ? "s" : ""} processing`,
        actionLabel: "Process",
        to: "/admin/invoice/withdrawal-requests",
        color: "warning.dark",
        bg: "warning.lighter",
        threshold: 0,
    },
    {
        key: "changes",
        icon: EditNoteOutlinedIcon,
        label: "Course Changes",
        descKey: "pendingCourseChanges",
        descFn: (n) => `${n} published course${n !== 1 ? "s" : ""} modified`,
        actionLabel: "Review Changes",
        to: "/admin/course/list",
        color: "info.main",
        bg: "info.lighter",
        threshold: 0,
    },
];

function ActionItem({ action, count, isLoading }) {
    const navigate = useNavigate();
    const hasItems = count > 0;
    const Icon = action.icon;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: "none" },
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: hasItems ? action.bg : "background.muted",
                    color: hasItems ? action.color : "text.disabled",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 20 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}>
                        {action.label}
                    </Typography>
                    {isLoading ? (
                        <Skeleton variant="rounded" width={28} height={20} />
                    ) : hasItems ? (
                        <Box
                            sx={{
                                bgcolor: action.color,
                                color: "#fff",
                                borderRadius: "20px",
                                px: 1,
                                py: 0.2,
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                minWidth: 20,
                                textAlign: "center",
                            }}
                        >
                            {count}
                        </Box>
                    ) : (
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "success.main" }} />
                    )}
                </Box>
                {isLoading ? (
                    <Skeleton variant="text" width="70%" />
                ) : (
                    <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.25, display: "block" }}>
                        {hasItems ? action.descFn(count) : "All clear"}
                    </Typography>
                )}
            </Box>

            <Button
                size="small"
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 9 }} />}
                onClick={() => navigate(action.to)}
                sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: hasItems ? action.color : "text.disabled",
                    bgcolor: hasItems ? action.bg : "transparent",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    "&:hover": { bgcolor: hasItems ? "action.hover" : "background.muted" },
                }}
            >
                {action.actionLabel}
            </Button>
        </Box>
    );
}

function PendingActionsWidget({ data, isLoading }) {
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
            <Box sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                    Pending Actions
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    Items requiring your attention
                </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
                {ACTIONS.map((action) => (
                    <ActionItem
                        key={action.key}
                        action={action}
                        count={data?.[action.descKey] ?? 0}
                        isLoading={isLoading}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default memo(PendingActionsWidget);
