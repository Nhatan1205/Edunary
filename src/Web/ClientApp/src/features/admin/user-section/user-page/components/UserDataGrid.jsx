import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Typography, Card, Table, TableBody, TableCell,
    TableContainer, TablePagination, Avatar, Box, Chip,
    Popover, FormControlLabel, Checkbox, Button,
    Tabs, Tab, MenuList, MenuItem, menuItemClasses,
    IconButton, Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import CheckIcon from "@mui/icons-material/Check";

import useDataGrid from "../../../../../hooks/common/useDataGrid";
import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";
import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import { formatShortDate, formatTimeAgo } from "../../../../../utils/helpers";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

// ── Constants ──────────────────────────────────────────────────────────────────

const cardSx = {
    borderRadius: "16px",
    bgcolor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
    overflow: "clip",
};

const HEAD_LABEL = [
    { id: "fullName", label: "User", minWidth: 220 },
    { id: "role", label: "Role", width: 130, minWidth: 110 },
    { id: "status", label: "Status", width: 120, minWidth: 100 },
    { id: "courses", label: "Courses", width: 170, minWidth: 150 },
    { id: "lastLoginTime", label: "Last Login", width: 150, minWidth: 130 },
    { id: "createdAt", label: "Joined", width: 130, minWidth: 110 },
];

const ROLE_OPTIONS = ["User", "Administrator"];

const STATUS_TABS = ["All", "Active", "Inactive", "Suspended", "Banned"];

const STATUS_TAB_COLOR = {
    Active: { color: "success.darker", bgcolor: "success.lighter" },
    Inactive: { color: "text.secondary", bgcolor: "grey.300" },
    Suspended: { color: "warning.dark", bgcolor: "warning.lighter" },
    Banned: { color: "error.dark", bgcolor: "error.lighter" },
};

const SORT_OPTIONS = [
    { value: "name", label: "Name (A–Z)", icon: <SortByAlphaIcon sx={{ fontSize: 16 }} /> },
    { value: "lastLogin", label: "Last Logged In", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { value: "newest", label: "Newest", icon: <FiberNewIcon sx={{ fontSize: 16 }} /> },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function applySort(list, sortBy) {
    const copy = [...list];
    if (sortBy === "name") return copy.sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? ""));
    if (sortBy === "lastLogin") return copy.sort((a, b) => (b.lastLoginTime ?? 0) > (a.lastLoginTime ?? 0) ? 1 : -1);
    // newest
    return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusChip({ status }) {
    const style = STATUS_TAB_COLOR[status] ?? { color: "text.secondary", bgcolor: "grey.200" };
    return (
        <Chip label={status} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px", color: style.color, bgcolor: style.bgcolor, border: "none" }} />
    );
}

function RoleChip({ role }) {
    const map = {
        SuperAdmin: { color: "warning.darker", bgcolor: "warning.lighter" },
        Administrator: { color: "secondaryBrand.dark", bgcolor: "secondaryBrand.lighter" },
        User: { color: "brand.dark", bgcolor: "brand.lighter" },
    };
    const style = map[role] ?? { color: "text.secondary", bgcolor: "grey.200" };
    return (
        <Chip label={role} size="small" sx={{ height: 24, fontSize: "0.72rem", fontWeight: 700, borderRadius: "6px", color: style.color, bgcolor: style.bgcolor, border: "none" }} />
    );
}

// ── Status Tabs ────────────────────────────────────────────────────────────────

function StatusTabs({ activeTab, onChange, counts }) {
    return (
        <Tabs
            value={activeTab}
            onChange={(_, v) => onChange(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
                px: 2.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                minHeight: 48,
                "& .MuiTabs-indicator": { bgcolor: "text.primary", height: 2, borderRadius: "2px 2px 0 0" },
            }}
        >
            {STATUS_TABS.map((tab) => {
                const count = counts[tab] ?? 0;
                const chipStyle = STATUS_TAB_COLOR[tab] ?? null;
                return (
                    <Tab
                        key={tab}
                        value={tab}
                        disableRipple
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: activeTab === tab ? 700 : 500,
                                        fontSize: "0.875rem",
                                        color: activeTab === tab ? "text.primary" : "text.secondary",
                                        transition: "color 0.15s",
                                    }}
                                >
                                    {tab}
                                </Typography>
                                {count > 0 && (
                                    <Box
                                        sx={{
                                            px: 0.85,
                                            py: 0.1,
                                            borderRadius: "6px",
                                            fontSize: "0.7rem",
                                            fontWeight: 700,
                                            lineHeight: "18px",
                                            minWidth: 20,
                                            textAlign: "center",
                                            ...(tab === "All"
                                                ? { bgcolor: "text.primary", color: "#fff" }
                                                : chipStyle
                                                    ? { bgcolor: chipStyle.bgcolor, color: chipStyle.color }
                                                    : { bgcolor: "grey.200", color: "text.secondary" }
                                            ),
                                        }}
                                    >
                                        {count}
                                    </Box>
                                )}
                            </Box>
                        }
                        sx={{ minHeight: 48, px: 0, mr: 3, textTransform: "none", py: 0 }}
                    />
                );
            })}
        </Tabs>
    );
}

function RoleFilterDropdown({ selectedRoles, onChange }) {
    const [anchor, setAnchor] = useState(null);

    const handleToggle = useCallback((role) => {
        onChange(selectedRoles.includes(role)
            ? selectedRoles.filter((r) => r !== role)
            : [...selectedRoles, role]);
    }, [selectedRoles, onChange]);

    const isFiltered = selectedRoles.length > 0 && selectedRoles.length < ROLE_OPTIONS.length;
    const label = isFiltered ? selectedRoles.join(", ") : "Role";

    return (
        <>
            <Button
                id="role-filter-btn"
                onClick={(e) => setAnchor(e.currentTarget)}
                endIcon={<ArrowDropDownIcon />}
                size="small"
                sx={{
                    height: 40, px: 2, borderRadius: "10px",
                    border: "1.5px solid",
                    borderColor: isFiltered ? "brand.main" : "grey.300",
                    bgcolor: "grey.50",
                    color: isFiltered ? "brand.main" : "text.secondary",
                    fontWeight: 500, fontSize: "0.875rem", textTransform: "none", whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "grey.100", borderColor: "grey.400" },
                }}
            >
                {label}
            </Button>

            <Popover
                open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { elevation: 0, sx: { mt: 0.75, minWidth: 180, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0px 4px 6px -2px rgba(16,24,40,0.05), 0px 12px 16px -4px rgba(16,24,40,0.10)", p: 1 } } }}
            >
                {ROLE_OPTIONS.map((role) => (
                    <FormControlLabel
                        key={role} label={role}
                        control={
                            <Checkbox size="small" checked={selectedRoles.includes(role)} onChange={() => handleToggle(role)}
                                sx={{ color: "#D1D5DB", "&.Mui-checked": { color: "brand.main" } }} />
                        }
                        sx={{
                            display: "flex", mx: 0, px: 1, py: 0.5, borderRadius: "8px",
                            "&:hover": { bgcolor: "#F9FAFB" },
                            "& .MuiFormControlLabel-label": { fontSize: "0.875rem", fontWeight: 500, color: "text.primary" },
                        }}
                    />
                ))}
            </Popover>
        </>
    );
}

function SortPopover({ sortBy, onChange }) {
    const [anchor, setAnchor] = useState(null);

    return (
        <>
            <Tooltip title="Sort">
                <IconButton
                    id="sort-btn"
                    onClick={(e) => setAnchor(e.currentTarget)}
                    size="small"
                    sx={{
                        color: sortBy !== "newest" ? "brand.main" : "grey.500",
                        borderRadius: "8px",
                        bgcolor: sortBy !== "newest" ? "background.muted" : "transparent",
                        "&:hover": { bgcolor: "grey.100", color: "text.primary" },
                    }}
                >
                    <FilterListIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Tooltip>

            <Popover
                open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 0.5, minWidth: 190, borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0px 4px 6px -2px rgba(16,24,40,0.05), 0px 12px 16px -4px rgba(16,24,40,0.10)",
                            overflow: "hidden",
                        },
                    },
                }}
            >
                <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid #F3F4F6" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Sort by
                    </Typography>
                </Box>
                <MenuList
                    disablePadding
                    sx={{
                        py: 0.75, px: 0.75, display: "flex", flexDirection: "column", gap: 0.25,
                        [`& .${menuItemClasses.root}`]: {
                            px: 1.5, py: 1, gap: 1.25, borderRadius: "8px",
                            fontSize: "0.875rem", fontWeight: 500,
                            color: "text.primary",
                            transition: "background-color 0.12s",
                            [`&:hover`]: { bgcolor: "#F9FAFB" },
                        },
                    }}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <MenuItem
                            key={opt.value}
                            selected={sortBy === opt.value}
                            onClick={() => { onChange(opt.value); setAnchor(null); }}
                            sx={{
                                justifyContent: "space-between",
                                ...(sortBy === opt.value && { bgcolor: "background.muted !important", color: "brand.main" }),
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit" }}>
                                <Box sx={{ color: sortBy === opt.value ? "brand.main" : "grey.500", display: "flex" }}>
                                    {opt.icon}
                                </Box>
                                {opt.label}
                            </Box>
                            {sortBy === opt.value && <CheckIcon sx={{ fontSize: 16, color: "brand.main" }} />}
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>
        </>
    );
}


function UserDataGrid({
    // Data từ API (controlled)
    items = [],
    totalCount = 0,
    isLoading = false,
    isError = false,
    statusCounts = null,

    // Pagination
    searchText,
    onSearchChange,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,

    // Filter state (controlled từ UserPage — ảnh hưởng API)
    activeTab,
    onTabChange,
    roleFilter,
    onRoleChange,
    sortBy,
    onSortChange,

    // Actions
    onRestrict,
    onUnban,
    onChangeRole,
    onViewDetail,
    onRefresh,
    isRefreshing = false,
}) {
    const table = useDataGrid({ defaultOrderBy: "fullName" });

    // RoleFilterDropdown cần array of selected roles, nhưng API nhận 1 role string
    // Wrap/unwrap để tương thích UI cũ
    const selectedRoles = roleFilter ? [roleFilter] : [];
    const handleRoleChange = useCallback((roles) => {
        onRoleChange(roles.length === 1 ? roles[0] : "");
    }, [onRoleChange]);

    // counts cho Status Tabs — dùng statusCounts từ API riêng (không phụ thuộc filter)
    // Nếu chưa có data thì hiện 0
    const counts = {
        All: statusCounts?.total ?? 0,
        Active: statusCounts?.active ?? 0,
        Inactive: statusCounts?.inactive ?? 0,
        Suspended: statusCounts?.suspended ?? 0,
        Banned: statusCounts?.banned ?? 0,
    };

    const navigate = useNavigate();

    const notFound = !isLoading && items.length === 0 && (!!searchText || roleFilter || activeTab !== "All");

    const isSanctioned = (row) => ["Banned", "Suspended"].includes(row.status);

    const actionItems = (row) => [
        { label: "View Detail", icon: <PersonIcon sx={{ fontSize: 16 }} />, onClick: () => navigate(`/admin/user/${row.id}`) },
        ...(isSanctioned(row)
            ? [{
                label: "Lift Restriction",
                icon: <LockOpenIcon sx={{ fontSize: 16 }} />,
                onClick: () => onUnban?.(row),
                color: "warning.main",
            }]
            : [{
                label: "Restrict User",
                icon: <BlockIcon sx={{ fontSize: 16 }} />,
                onClick: () => onRestrict?.(row),
                color: "error.main",
            }]
        ),
        { label: "Change Role", icon: <ManageAccountsIcon sx={{ fontSize: 16 }} />, onClick: () => onChangeRole?.(row) },
    ];

    const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

    return (
        <Card sx={cardSx}>
            {/* ── Status Tabs ── */}
            <StatusTabs activeTab={activeTab} onChange={onTabChange} counts={counts} />

            {/* ── Toolbar: Role filter + Search + Sort ── */}
            <DataGridToolbar
                filterName={searchText}
                onFilterName={(e) => { onSearchChange(e.target.value); onChangePage(null, 0); }}
                searchPlaceholder="Search name or email..."
                filterDropdowns={
                    <RoleFilterDropdown selectedRoles={selectedRoles} onChange={handleRoleChange} />
                }
                customRightAction={
                    <SortPopover sortBy={sortBy} onChange={onSortChange} />
                }
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />

            <TableContainer sx={{ maxHeight: 580, overflowY: "auto", overflowX: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 800, tableLayout: "fixed" }}>
                    <DataGridHead
                        order={table.order}
                        orderBy={table.orderBy}
                        rowCount={items.length}
                        numSelected={0}
                        onSort={table.onSort}
                        onSelectAllRows={() => { }}
                        headLabel={HEAD_LABEL}
                        showCheckbox={false}
                        showIndex={true}
                        showActions={true}
                    />
                    <TableBody>
                        {/* ── Skeleton khi đang load ── */}
                        {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
                            <DataGridSkeletonRow
                                key={i}
                                colCount={HEAD_LABEL.length}
                                showCheckbox={false}
                                showIndex={true}
                                showActions={true}
                            />
                        ))}

                        {/* ── Rows thật từ API ── */}
                        {!isLoading && items.map((row, index) => (
                            <DataGridRow
                                key={row.id}
                                selected={false}
                                onSelectRow={() => { }}
                                showCheckbox={false}
                                showIndex={true}
                                rowIndex={page * rowsPerPage + index + 1}
                                actionItems={actionItems(row)}
                                row={row}
                                viewLink={null}
                            >
                                {/* User — Avatar + Name + Email + online dot */}
                                <TableCell sx={{ ...bCell, py: "10px", overflow: "hidden" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                                            <Avatar src={row.avatar || defaultAvatar} alt={row.fullName} sx={{ width: 38, height: 38, fontSize: "0.9rem" }} />
                                            <Box sx={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", bgcolor: row.isOnline ? "success.main" : "grey.400", border: "2px solid #fff" }} />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                component={Link}
                                                to={`/admin/user/${row.id}`}
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "text.primary",
                                                    lineHeight: 1.3,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    display: "block",
                                                    textDecoration: "none",
                                                    transition: "color 0.15s",
                                                    "&:hover": { color: "brand.main", textDecoration: "underline" },
                                                }}
                                            >
                                                {row.fullName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                                {row.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Role — API trả roles[] array, lấy phần tử đầu */}
                                <TableCell sx={bCell}><RoleChip role={row.roles?.[0] ?? "User"} /></TableCell>
                                <TableCell sx={bCell}><StatusChip status={row.status} /></TableCell>

                                {/* Courses — API dùng enrolledCourseCount, createdCourseCount */}
                                <TableCell sx={bCell}>
                                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary", lineHeight: 1.5 }}>📚 {row.enrolledCourseCount ?? 0} enrolled</Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "text.secondary", lineHeight: 1.5 }}>📝 {row.createdCourseCount ?? 0} created</Typography>
                                </TableCell>

                                <TableCell sx={bCell}>{row.lastLoginTime ? formatTimeAgo(row.lastLoginTime) : "Never"}</TableCell>
                                <TableCell sx={bCell}>{formatShortDate(row.createdAt) ?? "—"}</TableCell>
                            </DataGridRow>
                        ))}

                        {notFound && <DataGridNoData searchQuery={searchText || activeTab} colSpan={HEAD_LABEL.length + 2} />}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                page={page}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={onChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={onChangeRowsPerPage}
                sx={{
                    borderTop: "1px solid #F3F4F6",
                    "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem", color: "#6B7280", mb: 0 },
                    "& .MuiTablePagination-select": { fontSize: "0.8rem" },
                }}
            />
        </Card>
    );
}

export default UserDataGrid;
