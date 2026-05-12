import { useState, useCallback } from "react";
import {
    Typography, Card, Table, TableBody, TableCell,
    TableContainer, TablePagination, Avatar, Box, Chip,
    Popover, Button, MenuList, MenuItem, menuItemClasses,
    IconButton, Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import useDataGrid from "../../../../../hooks/common/useDataGrid";
import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";
import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import { getActivityTypeLabel } from "../../../../../utils/helpers";
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
    { id: "user", label: "User", width: "25%", minWidth: 200 },
    { id: "activityType", label: "Activity Type", width: "22%", minWidth: 170 },
    { id: "description", label: "Description", width: "35%", minWidth: 200 },
    { id: "created", label: "Date", width: "18%", minWidth: 150 },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest", icon: <FiberNewIcon sx={{ fontSize: 16 }} /> },
    { value: "oldest", label: "Oldest", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatLogDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActivityTypeChip({ value }) {
    const label = getActivityTypeLabel(value);

    // Premium explicit colors per category
    let color, bgcolor, borderColor;
    if (value >= 200) {
        // Admin — purple/violet
        color = "#6941C6"; bgcolor = "#F4F3FF"; borderColor = "#D9D6FE";
    } else if (value >= 50) {
        // Page access — slate/neutral
        color = "#344054"; bgcolor = "#F2F4F7"; borderColor = "#D0D5DD";
    } else if (value <= 2) {
        // Auth — teal/green
        color = "#027A48"; bgcolor = "#ECFDF3"; borderColor = "#ABEFC6";
    } else {
        // User actions — amber/orange
        color = "#B54708"; bgcolor = "#FFFAEB"; borderColor = "#FEDF89";
    }

    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 24, fontSize: "0.72rem", fontWeight: 700,
                borderRadius: "6px",
                border: `1px solid ${borderColor}`,
                color, bgcolor,
                letterSpacing: "0.01em",
            }}
        />
    );
}

function SortPopover({ sortBy, onChange }) {
    const [anchor, setAnchor] = useState(null);

    return (
        <>
            <Tooltip title="Sort">
                <IconButton
                    id="activity-sort-btn"
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
                            mt: 0.5, minWidth: 180, borderRadius: "12px",
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
                            fontSize: "0.875rem", fontWeight: 500, color: "text.primary",
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

function UserFilterButton({ selectedUser, onOpen, onClear }) {
    const isFiltered = !!selectedUser;

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
                id="user-filter-btn"
                onClick={onOpen}
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
                {isFiltered ? selectedUser.fullName : "All Users"}
            </Button>
            {isFiltered && (
                <Tooltip title="Clear user filter">
                    <IconButton
                        size="small"
                        onClick={onClear}
                        sx={{ color: "grey.500", "&:hover": { color: "error.main", bgcolor: "error.lighter" }, borderRadius: "8px" }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}

// ── ActivityLogsDataGrid ───────────────────────────────────────────────────────

function ActivityLogsDataGrid({
    // Data
    items = [],
    totalCount = 0,
    isLoading = false,
    isError = false,

    // Pagination (controlled from parent)
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,

    // Filters (controlled from parent)
    searchText,
    onSearchChange,
    sortBy,
    onSortChange,
    selectedUser,
    onOpenUserFilter,
    onClearUserFilter,

    // Date range (controlled from parent)
    from,
    onFromChange,
    to,
    onToChange,

    // Delete
    onDelete,

    // Refresh
    onRefresh,
    isRefreshing = false,
}) {
    const table = useDataGrid({ defaultOrderBy: "created" });

    // ── Confirm delete state ───────────────────────────────────────────────────
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

    const openConfirm = useCallback((ids) => {
        setPendingDeleteIds(ids);
        setConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        onDelete?.(pendingDeleteIds);
        table.onClearSelected();
        setConfirmOpen(false);
        setPendingDeleteIds([]);
    }, [onDelete, pendingDeleteIds, table]);

    const handleCancelDelete = useCallback(() => {
        setConfirmOpen(false);
        setPendingDeleteIds([]);
    }, []);

    const notFound = !isLoading && items.length === 0 && (!!searchText || !!selectedUser || !!from || !!to);
    const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

    const handleSingleDelete = useCallback((row) => {
        openConfirm([row.id]);
    }, [openConfirm]);

    const handleBulkDelete = useCallback(() => {
        openConfirm(table.selected);
    }, [openConfirm, table.selected]);

    const actionItems = (row) => [
        {
            label: "Delete",
            icon: <DeleteOutlineIcon sx={{ fontSize: 16 }} />,
            onClick: () => handleSingleDelete(row),
            color: "error.main",
        },
    ];

    // Date range pickers as filter dropdowns
    const dateRangeFilter = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
                component="input"
                type="date"
                value={from || ""}
                onChange={(e) => onFromChange(e.target.value || null)}
                title="From date"
                sx={{
                    height: 40, px: 1.5, borderRadius: "10px",
                    border: "1.5px solid", borderColor: from ? "brand.main" : "grey.300",
                    bgcolor: "grey.50", color: from ? "brand.main" : "text.secondary",
                    fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer",
                    outline: "none", "&:focus": { borderColor: "brand.main" },
                }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>—</Typography>
            <Box
                component="input"
                type="date"
                value={to || ""}
                onChange={(e) => onToChange(e.target.value || null)}
                title="To date"
                sx={{
                    height: 40, px: 1.5, borderRadius: "10px",
                    border: "1.5px solid", borderColor: to ? "brand.main" : "grey.300",
                    bgcolor: "grey.50", color: to ? "brand.main" : "text.secondary",
                    fontSize: "0.8rem", fontFamily: "inherit", cursor: "pointer",
                    outline: "none", "&:focus": { borderColor: "brand.main" },
                }}
            />
        </Box>
    );

    return (
        <>
            <Card sx={cardSx}>
                {/* ── Toolbar ── */}
                <DataGridToolbar
                    numSelected={table.selected.length}
                    filterName={searchText}
                    onFilterName={(e) => { onSearchChange(e.target.value); onChangePage(null, 0); }}
                    searchPlaceholder="Search description..."
                    onBulkDelete={handleBulkDelete}
                    filterDropdowns={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <UserFilterButton
                                selectedUser={selectedUser}
                                onOpen={onOpenUserFilter}
                                onClear={onClearUserFilter}
                            />
                            {dateRangeFilter}
                        </Box>
                    }
                    customRightAction={
                        <SortPopover sortBy={sortBy} onChange={onSortChange} />
                    }
                    onRefresh={onRefresh}
                    isRefreshing={isRefreshing}
                />

                {/* ── Table ── */}
                <TableContainer sx={{ maxHeight: 580, overflowY: "auto", overflowX: "auto" }}>
                    <Table stickyHeader sx={{ minWidth: 800, tableLayout: "fixed" }}>
                        <DataGridHead
                            order={table.order}
                            orderBy={table.orderBy}
                            rowCount={items.length}
                            numSelected={table.selected.length}
                            onSort={table.onSort}
                            onSelectAllRows={(checked) => table.onSelectAllRows(checked, items.map((i) => i.id))}
                            headLabel={HEAD_LABEL}
                            showCheckbox={true}
                            showIndex={true}
                            showActions={true}
                        />
                        <TableBody>
                            {/* Skeleton rows while loading */}
                            {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
                                <DataGridSkeletonRow
                                    key={i}
                                    colCount={HEAD_LABEL.length}
                                    showCheckbox={true}
                                    showIndex={true}
                                    showActions={true}
                                />
                            ))}

                            {/* Data rows */}
                            {!isLoading && items.map((row, index) => (
                                <DataGridRow
                                    key={row.id}
                                    selected={table.selected.includes(row.id)}
                                    onSelectRow={() => table.onSelectRow(row.id)}
                                    showCheckbox={true}
                                    showIndex={true}
                                    rowIndex={page * rowsPerPage + index + 1}
                                    actionItems={actionItems(row)}
                                    row={row}
                                    viewLink={null}
                                >
                                    {/* User — Avatar + FullName + Email */}
                                    <TableCell sx={{ ...bCell, py: "10px", overflow: "hidden" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar
                                                src={row.avatar || defaultAvatar}
                                                alt={row.fullName}
                                                sx={{ width: 38, height: 38, fontSize: "0.9rem" }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                                >
                                                    {row.fullName || "Unknown"}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
                                                >
                                                    {row.email || "—"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Activity Type */}
                                    <TableCell sx={bCell}>
                                        <ActivityTypeChip value={row.activityType} />
                                    </TableCell>

                                    {/* Description */}
                                    <TableCell sx={{ ...bCell, overflow: "hidden" }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                        >
                                            {row.description || "—"}
                                        </Typography>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell sx={bCell}>
                                        <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 500 }}>
                                            {formatLogDate(row.created)}
                                        </Typography>
                                    </TableCell>
                                </DataGridRow>
                            ))}

                            {notFound && (
                                <DataGridNoData
                                    searchQuery={searchText || selectedUser?.fullName || ""}
                                    colSpan={HEAD_LABEL.length + 3}
                                />
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ── Pagination ── */}
                <TablePagination
                    component="div"
                    page={page}
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    onPageChange={onChangePage}
                    rowsPerPageOptions={[10, 20, 50]}
                    onRowsPerPageChange={onChangeRowsPerPage}
                    sx={{
                        borderTop: "1px solid #F3F4F6",
                        "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
                        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem", color: "#6B7280", mb: 0 },
                        "& .MuiTablePagination-select": { fontSize: "0.8rem" },
                    }}
                />
            </Card>

            {/* ── Confirm delete dialog ── */}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Activity Log"
                message={
                    pendingDeleteIds.length > 1
                        ? `Are you sure you want to delete ${pendingDeleteIds.length} activity logs? This action cannot be undone.`
                        : "Are you sure you want to delete this activity log? This action cannot be undone."
                }
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default ActivityLogsDataGrid;
