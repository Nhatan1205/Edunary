import { useState } from "react";
import { useNavigate } from "react-router";
import {
    Box, Typography, Card, Chip, Avatar, Tooltip, IconButton,
    Table, TableBody, TableCell, TableContainer, TablePagination,
    Tabs, Tab, Checkbox, FormControlLabel, Popover, MenuList, MenuItem, menuItemClasses,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";
import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import { formatTimeAgo } from "../../../../../utils/helpers";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

const cardSx = {
    borderRadius: "16px",
    bgcolor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    boxShadow:
        "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
    overflow: "clip",
};

const SORT_OPTIONS = [
    { value: "submitted_asc", label: "Oldest", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    { value: "submitted_desc", label: "Newest", icon: <FiberNewIcon sx={{ fontSize: 16 }} /> },
    { value: "attempt_desc", label: "Highest Attempt", icon: <SortByAlphaIcon sx={{ fontSize: 16 }} /> },
    { value: "attempt_asc", label: "Lowest Attempt", icon: <SortByAlphaIcon sx={{ fontSize: 16 }} /> },
];

const HEAD_LABEL = [
    { id: "courseTitle", label: "Course", minWidth: 260 },
    { id: "instructorName", label: "Instructor", width: 160, minWidth: 140 },
    { id: "submissionNumber", label: "Attempt", width: 90, minWidth: 80 },
    { id: "submittedAt", label: "Submitted", width: 140, minWidth: 120 },
];

const STATUS_TABS = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Needs Changes" },
    { value: 2, label: "Approved" },
];

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
                        color: sortBy !== "submitted_desc" ? "brand.main" : "grey.500",
                        borderRadius: "8px",
                        bgcolor: sortBy !== "submitted_desc" ? "background.muted" : "transparent",
                        "&:hover": { bgcolor: "grey.100", color: "text.primary" },
                    }}
                >
                    <FilterListIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Tooltip>

            <Popover
                open={!!anchor}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 0.5,
                            minWidth: 190,
                            borderRadius: "12px",
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
                        py: 0.75,
                        px: 0.75,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                        [`& .${menuItemClasses.root}`]: {
                            px: 1.5,
                            py: 1,
                            gap: 1.25,
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: 500,
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

function CourseApprovalDataGrid({
    items,
    totalCount,
    counts,
    isLoading,
    searchText,
    onSearchChange,
    activeTab,
    onTabChange,
    isFirstOnly,
    onFirstOnlyChange,
    sortBy,
    onSortByChange,
    page,
    onPageChange,
    rowsPerPage,
    onRowsPerPageChange,
    onRefresh,
    isRefreshing,
}) {
    const navigate = useNavigate();

    const paginated = items;
    const notFound = !isLoading && paginated.length === 0;

    const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

    const actionItems = (row) => [

    ];

    const filterDropdowns = (
        <FormControlLabel
            control={
                <Checkbox
                    checked={isFirstOnly}
                    onChange={(e) => { onFirstOnlyChange(e.target.checked); onPageChange(0); }}
                    size="small"
                    sx={{ color: "grey.400", "&.Mui-checked": { color: "brand.main" } }}
                />
            }
            label={
                <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
                    First Submission
                </Typography>
            }
        />
    );

    return (
        <Card sx={cardSx}>
            {/* Status Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, v) => { onTabChange(v); onPageChange(0); }}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                    px: 2.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    minHeight: 48,
                    "& .MuiTabs-indicator": {
                        bgcolor: "text.primary",
                        height: 2,
                        borderRadius: "2px 2px 0 0",
                    },
                }}
            >
                {STATUS_TABS.map((tab) => (
                    <Tab
                        key={tab.value}
                        value={tab.value}
                        disableRipple
                        label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: activeTab === tab.value ? 700 : 500,
                                        fontSize: "0.875rem",
                                        color: activeTab === tab.value ? "text.primary" : "text.secondary",
                                    }}
                                >
                                    {tab.label}
                                </Typography>
                                {(counts || activeTab === tab.value) && (
                                    <Box
                                        sx={{
                                            px: 0.85,
                                            borderRadius: "6px",
                                            fontSize: "0.7rem",
                                            fontWeight: 700,
                                            lineHeight: "18px",
                                            minWidth: 20,
                                            textAlign: "center",
                                            bgcolor: activeTab === tab.value ? "text.primary" : "grey.200",
                                            color: activeTab === tab.value ? "#fff" : "text.secondary",
                                        }}
                                    >
                                        {counts ? (counts[tab.value] ?? 0) : totalCount}
                                    </Box>
                                )}
                            </Box>
                        }
                        sx={{ minHeight: 48, px: 0, mr: 3, textTransform: "none", py: 0 }}
                    />
                ))}
            </Tabs>

            {/* Toolbar */}
            <DataGridToolbar
                filterName={searchText}
                onFilterName={(e) => { onSearchChange(e.target.value); onPageChange(0); }}
                searchPlaceholder="Search course..."
                filterDropdowns={filterDropdowns}
                customRightAction={
                    <SortPopover sortBy={sortBy} onChange={(v) => { onSortByChange(v); onPageChange(0); }} />
                }
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />

            <TableContainer sx={{ minHeight: 450, maxHeight: 580, overflowY: "auto", overflowX: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 800, tableLayout: "fixed" }}>
                    <DataGridHead
                        order="desc"
                        orderBy="submittedAt"
                        rowCount={paginated.length}
                        numSelected={0}
                        onSort={() => { }}
                        onSelectAllRows={() => { }}
                        headLabel={HEAD_LABEL}
                        showCheckbox={false}
                        showIndex={true}
                        showActions={true}
                    />
                    <TableBody>
                        {isLoading &&
                            Array.from({ length: rowsPerPage }).map((_, i) => (
                                <DataGridSkeletonRow
                                    key={i}
                                    colCount={HEAD_LABEL.length}
                                    showCheckbox={false}
                                    showIndex={true}
                                    showActions={true}
                                />
                            ))}

                        {!isLoading &&
                            paginated.map((row, index) => (
                                <DataGridRow
                                    key={row.submissionId}
                                    selected={false}
                                    onSelectRow={() => { }}
                                    showCheckbox={false}
                                    showIndex={true}
                                    rowIndex={page * rowsPerPage + index + 1}
                                    actionItems={actionItems(row)}
                                    row={row}
                                    viewLink={`/admin/course/approvals/${row.submissionId}`}
                                >
                                    {/* Course */}
                                    <TableCell sx={{ ...bCell, py: "10px", overflow: "hidden" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Avatar
                                                src={row.imageUrl}
                                                variant="rounded"
                                                sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: "background.muted" }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: "text.primary",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        display: "block",
                                                        cursor: "pointer",
                                                        "&:hover": { color: "brand.main" },
                                                    }}
                                                    onClick={() => navigate(`/admin/course/approvals/${row.submissionId}`)}
                                                >
                                                    {row.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                                                    {row.categoryName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Instructor */}
                                    <TableCell sx={bCell}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar
                                                src={row.instructorAvatar || defaultAvatar}
                                                sx={{ width: 26, height: 26, fontSize: "0.75rem" }}
                                            >
                                                {row.instructorName?.[0]}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.primary" }}>
                                                {row.instructorName}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Attempt */}
                                    <TableCell sx={bCell}>
                                        <Chip
                                            label={`#${row.submissionNumber}`}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: "0.72rem",
                                                fontWeight: 700,
                                                borderRadius: "6px",
                                                bgcolor: row.submissionNumber > 1 ? "warning.lighter" : "brand.lighter",
                                                color: row.submissionNumber > 1 ? "warning.dark" : "brand.dark",
                                            }}
                                        />
                                    </TableCell>

                                    {/* Submitted */}
                                    <TableCell sx={bCell}>{formatTimeAgo(row.submittedAt)}</TableCell>
                                </DataGridRow>
                            ))}

                        {notFound && (
                            <DataGridNoData
                                searchQuery={searchText}
                                colSpan={HEAD_LABEL.length + 2}
                            />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                page={page}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => onPageChange(p)}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={(e) => { onRowsPerPageChange(parseInt(e.target.value, 10)); onPageChange(0); }}
                sx={{
                    borderTop: "1px solid #F3F4F6",
                    "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        fontSize: "0.8rem",
                        color: "#6B7280",
                        mb: 0,
                    },
                    "& .MuiTablePagination-select": { fontSize: "0.8rem" },
                }}
            />
        </Card>
    );
}

export default CourseApprovalDataGrid;