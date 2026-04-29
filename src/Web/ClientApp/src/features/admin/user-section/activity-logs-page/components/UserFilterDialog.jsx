import { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, Box, InputBase,
    InputAdornment, Avatar, Typography, Chip, IconButton, CircularProgress,
} from "@mui/material";
import useDebounce from "../../../../../hooks/common/useDebounce";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CustomPagination from "../../../../../components/pagination/CustomPagination";
import useAdminGetUsers from "../../../../../hooks/user-hooks/useAdminGetUsers";
import NoData from "../../../../../components/NoData";
import emptyStateImg from "../../../../../assets/images/empty-courses.png";

// ── Status chip ────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
    Active: { color: "success.darker", bgcolor: "success.lighter" },
    Inactive: { color: "text.secondary", bgcolor: "grey.300" },
    Suspended: { color: "warning.dark", bgcolor: "warning.lighter" },
    Banned: { color: "error.dark", bgcolor: "error.lighter" },
};

function StatusChip({ status }) {
    const style = STATUS_COLOR[status] ?? { color: "text.secondary", bgcolor: "grey.200" };
    return (
        <Chip
            label={status}
            size="small"
            sx={{
                height: 22, fontSize: "0.7rem", fontWeight: 700,
                borderRadius: "6px", border: "none",
                color: style.color, bgcolor: style.bgcolor,
            }}
        />
    );
}

// ── UserFilterDialog ───────────────────────────────────────────────────────────

function UserFilterDialog({ open, onClose, onSelectUser }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading } = useAdminGetUsers(
        debouncedSearch, "", "", "newest", page, PAGE_SIZE
    );

    const users = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleClose = () => {
        setSearch("");
        setPage(1);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0px 8px 24px rgba(16,24,40,0.12)",
                        overflow: "hidden",
                    },
                },
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6" }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Filter by User
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: "grey.500", borderRadius: "8px", "&:hover": { bgcolor: "grey.100" } }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Search */}
                <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
                    <Box sx={{
                        display: "flex", alignItems: "center", gap: 1, height: 40, px: 1.5,
                        borderRadius: "10px", border: "1.5px solid", borderColor: "grey.300", bgcolor: "grey.50",
                        transition: "all 0.18s",
                        "&:focus-within": { bgcolor: "background.paper", borderColor: "brand.main", boxShadow: "0 0 0 3px rgba(0,167,111,0.10)" },
                    }}>
                        <InputAdornment position="start" disablePointerEvents>
                            <SearchIcon sx={{ fontSize: 18, color: "grey.400" }} />
                        </InputAdornment>
                        <InputBase
                            fullWidth
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search users..."
                            sx={{ fontSize: "0.875rem", color: "text.primary", "& input::placeholder": { color: "grey.400", opacity: 1 } }}
                        />
                    </Box>
                </Box>

                {/* User list */}
                <Box sx={{ height: 390, overflowY: "auto" }}>
                    {isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                            <CircularProgress size={28} sx={{ color: "brand.main" }} />
                        </Box>
                    ) : users.length === 0 ? (
                        <NoData
                            image={emptyStateImg}
                            title="No users found"
                            description="Try a different search term."
                            imageWidth={120}
                            minHeight="350px"
                        />
                    ) : (
                        users.map((user) => (
                            <Box
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 1.5,
                                    px: 2.5, py: 1.5, cursor: "pointer",
                                    borderBottom: "1px solid #F9FAFB",
                                    transition: "background-color 0.12s",
                                    "&:hover": { bgcolor: "#F9FAFB" },
                                    "&:last-child": { borderBottom: "none" },
                                }}
                            >
                                <Avatar
                                    src={user.avatar || undefined}
                                    alt={user.fullName}
                                    sx={{ width: 36, height: 36, fontSize: "0.85rem" }}
                                >
                                    {!user.avatar && user.fullName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {user.fullName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                        {user.email}
                                    </Typography>
                                </Box>
                                <StatusChip status={user.status} />
                            </Box>
                        ))
                    )}
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ borderTop: "1px solid #F3F4F6" }}>
                        <CustomPagination
                            count={totalPages}
                            page={page}
                            onChange={(_, newPage) => setPage(newPage)}
                        />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default UserFilterDialog;
