import { useState } from "react";
import {
    Typography, Card, Table, TableBody, TableCell,
    TableContainer, TablePagination, Avatar, Box, Button,
    Popover, MenuList, MenuItem, menuItemClasses,
    IconButton, Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckIcon from "@mui/icons-material/Check";
import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";
import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import DefaultSelect from "../../../../../components/drop-down/DefaultSelect";
import { formatShortDate, formatTimeAgo } from "../../../../../utils/helpers";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

const cardSx = {
    borderRadius: "12px",
    bgcolor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    boxShadow: "0px 1px 3px rgba(16,24,40,0.06)",
    overflow: "clip",
};

const HEAD_LABEL = [
    { id: "fullName", label: "Student", width: "25%" },
    { id: "course", label: "Course", width: "20%" },
    { id: "enrolledDate", label: "Enrolled", width: "12%" },
    { id: "progress", label: "Progress", width: "20%" },
    { id: "lastActiveDate", label: "Last Active", width: "13%" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Enroll Date (newest)", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { value: "progress", label: "Progress (highest)", icon: <TrendingUpIcon sx={{ fontSize: 16 }} /> },
    { value: "name", label: "Name (A–Z)", icon: <SortByAlphaIcon sx={{ fontSize: 16 }} /> },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ completed, total }) {
    const value = total > 0 ? Math.round((completed / total) * 100) : 0;
    const color = value >= 80 ? "#22C55E" : value >= 40 ? "#3B82F6" : "#F59E0B";
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#F3F4F6", overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: `${value}%`, bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color, minWidth: 32, textAlign: "right" }}>
                {value}%
            </Typography>
        </Box>
    );
}

function SortPopover({ sortBy, onChange }) {
    const [anchor, setAnchor] = useState(null);
    return (
        <>
            <Tooltip title="Sort">
                <IconButton
                    id="student-sort-btn"
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
                            mt: 0.5, minWidth: 210, borderRadius: "12px",
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

function StudentDataGrid({
    items = [],
    totalCount = 0,
    isLoading = false,
    selectedCourse,
    onCourseChange,
    sortBy,
    onSortChange,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,

    // Lists
    courses = [],

    // Actions
    onViewDetail,
}) {
    const notFound = !isLoading && items.length === 0;

    const actionItems = (row) => [
        {
            label: "View Detail",
            icon: <PersonSearchIcon sx={{ fontSize: 16 }} />,
            onClick: () => onViewDetail?.(row),
        },
    ];

    const bCell = { py: "12px", fontSize: "0.875rem", color: "text.secondary" };

    return (
        <Card sx={cardSx}>
            {/* Toolbar */}
            <DataGridToolbar
                filterName=""
                onFilterName={null}
                searchPlaceholder=""
                showSearch={false}
                filterDropdowns={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        {courses.length > 0 && (
                            <DefaultSelect
                                data={courses}
                                value={selectedCourse}
                                onChange={(v) => { onCourseChange(v); onPageChange(null, 0); }}
                                defaultLabel="All courses"
                            />
                        )}
                    </Box>
                }
                customRightAction={<SortPopover sortBy={sortBy} onChange={(v) => { onSortChange(v); onPageChange(null, 0); }} />}
            />

            <TableContainer sx={{ overflowX: "auto", minHeight: 420 }}>
                <Table sx={{ width: "100%", tableLayout: "fixed" }}>
                    <DataGridHead
                        order="asc"
                        orderBy=""
                        rowCount={items.length}
                        numSelected={0}
                        onSort={() => { }}
                        onSelectAllRows={() => { }}
                        headLabel={HEAD_LABEL}
                        showCheckbox={false}
                        showIndex={true}
                        showActions={true}
                    />
                    <TableBody>
                        {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
                            <DataGridSkeletonRow
                                key={i}
                                colCount={HEAD_LABEL.length}
                                showCheckbox={false}
                                showIndex={true}
                                showActions={true}
                            />
                        ))}

                        {!isLoading && items.map((row, index) => (
                            <DataGridRow
                                key={`${row.studentId}-${row.courseId}`}
                                selected={false}
                                onSelectRow={() => { }}
                                showCheckbox={false}
                                showIndex={true}
                                rowIndex={page * rowsPerPage + index + 1}
                                actionItems={actionItems(row)}
                                row={row}
                                viewLink={null}
                            >
                                {/* Student */}
                                <TableCell sx={{ ...bCell, py: "10px", overflow: "hidden" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Avatar
                                            src={row.avatar || defaultAvatar}
                                            alt={row.fullName}
                                            sx={{ width: 36, height: 36, flexShrink: 0 }}
                                        />
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600, fontSize: "0.875rem", color: "text.primary",
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                    cursor: "pointer",
                                                    "&:hover": { color: "brand.main", textDecoration: "underline" },
                                                }}
                                                onClick={() => onViewDetail?.(row)}
                                            >
                                                {row.fullName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                                                {row.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Course */}
                                <TableCell sx={{ ...bCell, overflow: "hidden" }}>
                                    <Typography sx={{ fontSize: "0.85rem", color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {row.courseTitle}
                                    </Typography>
                                </TableCell>

                                {/* Enrolled */}
                                <TableCell sx={bCell}>{formatShortDate(row.enrolledDate) ?? "—"}</TableCell>

                                {/* Progress */}
                                <TableCell sx={bCell}>
                                    <ProgressBar completed={row.completedItems} total={row.totalItems} />
                                </TableCell>

                                {/* Last Active */}
                                <TableCell sx={bCell}>{formatTimeAgo(row.lastActiveDate)}</TableCell>
                            </DataGridRow>
                        ))}

                        {notFound && (
                            <DataGridNoData colSpan={HEAD_LABEL.length + 2} />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                page={page}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                rowsPerPageOptions={[10, 25, 50]}
                onRowsPerPageChange={onRowsPerPageChange}
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

export default StudentDataGrid;
