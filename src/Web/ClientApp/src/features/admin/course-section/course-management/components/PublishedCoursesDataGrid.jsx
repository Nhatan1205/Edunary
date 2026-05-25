import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Card,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  Checkbox,
  FormControlLabel,
  Popover,
  MenuList,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  TableRow,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import FilterListIcon from "@mui/icons-material/FilterList";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";

import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";
import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import useGetCategories from "../../../../../hooks/category-hooks/useGetCategories";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "clip",
};

const SORT_OPTIONS = [
  { value: "recently_modified", label: "Recently Modified", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
  { value: "title_asc", label: "Title (A-Z)", icon: <SortByAlphaIcon sx={{ fontSize: 16 }} /> },
  { value: "newest_first", label: "Newest", icon: <FiberNewIcon sx={{ fontSize: 16 }} /> },
  { value: "most_students", label: "Most Popular", icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
  { value: "highest_rating", label: "Top Rated", icon: <StarIcon sx={{ fontSize: 16 }} /> },
];

const HEAD_LABEL = [
  { id: "course", label: "Course", minWidth: 260 },
  { id: "instructor", label: "Instructor", minWidth: 220 },
  { id: "price", label: "Price", minWidth: 90 },
  { id: "students", label: "Students", minWidth: 100 },
  { id: "rating", label: "Rating", minWidth: 90 },
  { id: "modified", label: "Sync Status", minWidth: 90 },
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
            color: "brand.main",
            borderRadius: "8px",
            bgcolor: "background.muted",
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
        <MenuList disablePadding sx={{ py: 0.75 }}>
          {SORT_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === sortBy}
              onClick={() => {
                onChange(option.value);
                setAnchor(null);
              }}
              sx={{
                px: 1.5,
                py: 1,
                gap: 1.5,
                fontSize: "0.875rem",
                color: option.value === sortBy ? "brand.main" : "text.primary",
                fontWeight: option.value === sortBy ? 600 : 400,
              }}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}

export default function PublishedCoursesDataGrid({
  items,
  totalCount,
  isLoading,
  searchText,
  onSearchChange,
  categoryId,
  onCategoryChange,
  modifiedOnly,
  onModifiedOnlyChange,
  sortBy,
  onSortByChange,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  onRefresh,
  isRefreshing,
  onUnpublishClick,
  onViewChangesClick,
}) {
  const { data: catData } = useGetCategories(1, 100);
  const categories = catData?.items ?? [];

  const actionItems = (row) => [
    {
      label: "View Changes",
      icon: <CompareArrowsIcon sx={{ fontSize: 16 }} />,
      onClick: () => onViewChangesClick(row),
    },
    {
      label: "Preview Course",
      icon: <VisibilityIcon sx={{ fontSize: 16 }} />,
      onClick: () => window.open(`/course/${row.courseId}`, "_blank"),
    },
    {
      label: "Unpublish",
      icon: <UnpublishedIcon sx={{ fontSize: 16 }} />,
      onClick: () => onUnpublishClick(row),
      color: "error.main",
    },
  ];

  const filterDropdowns = (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={categoryId ?? ""}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          label="Category"
          sx={{ borderRadius: "10px" }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Checkbox
            checked={modifiedOnly}
            onChange={(e) => onModifiedOnlyChange(e.target.checked)}
            color="brand"
          />
        }
        label={
          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
            Modified Only
          </Typography>
        }
      />
    </Box>
  );

  return (
    <Card sx={cardSx}>
      <DataGridToolbar
        filterName={searchText}
        onFilterName={(e) => onSearchChange(e.target.value)}
        searchPlaceholder="Search courses..."
        filterDropdowns={filterDropdowns}
        customRightAction={<SortPopover sortBy={sortBy} onChange={onSortByChange} />}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      <TableContainer sx={{ position: "relative", minHeight: 600, overflow: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <DataGridHead
            headLabel={HEAD_LABEL}
            showCheckbox={false}
            showIndex={true}
            showActions={true}
          />
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowsPerPage }).map((_, idx) => (
                <DataGridSkeletonRow
                  key={idx}
                  colCount={HEAD_LABEL.length}
                  showCheckbox={false}
                  showIndex={true}
                  showActions={true}
                />
              ))
            ) : items.length === 0 ? (
              <DataGridNoData searchQuery={searchText} colSpan={HEAD_LABEL.length + 2} />
            ) : (
              items.map((row, index) => {
                const rowIndex = page * rowsPerPage + index + 1;
                return (
                  <DataGridRow
                    key={row.courseId}
                    selected={false}
                    onSelectRow={() => { }}
                    showCheckbox={false}
                    showIndex={true}
                    rowIndex={rowIndex}
                    actionItems={actionItems(row)}
                    row={row}
                    viewLink={null}
                  >
                    {/* Course */}
                    <TableCell sx={{ minWidth: 260, py: "14px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={row.imageUrl}
                          sx={{ width: 64, height: 36, borderRadius: "6px", border: "1px solid #F3F4F6" }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}
                          >
                            {row.title}
                          </Typography>
                          <Chip
                            label={row.categoryName}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              bgcolor: "grey.100",
                              color: "text.secondary",
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Instructor */}
                    <TableCell sx={{ minWidth: 160, py: "14px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={row.instructorAvatar || defaultAvatar}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                          {row.instructorName || "Unknown"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell sx={{ minWidth: 90, py: "14px" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {row.price === 0 ? "Free" : `$${row.price.toFixed(2)}`}
                      </Typography>
                    </TableCell>

                    {/* Students */}
                    <TableCell sx={{ minWidth: 100, py: "14px" }}>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        {row.totalStudents?.toLocaleString() ?? 0}
                      </Typography>
                    </TableCell>

                    {/* Rating */}
                    <TableCell sx={{ minWidth: 90, py: "14px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {row.ratings > 0 ? row.ratings.toFixed(1) : "—"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Sync Status */}
                    <TableCell sx={{ minWidth: 90, py: "14px" }}>
                      {row.isModifiedSinceApproval ? (
                        <Chip
                          label="Modified"
                          size="small"
                          sx={{
                            bgcolor: "warning.lighter",
                            color: "warning.dark",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            border: "1px solid",
                            borderColor: "warning.light",
                          }}
                        />
                      ) : (
                        <Chip
                          label="Synced"
                          size="small"
                          sx={{
                            bgcolor: "success.lighter",
                            color: "success.dark",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            border: "1px solid",
                            borderColor: "success.light",
                          }}
                        />
                      )}
                    </TableCell>
                  </DataGridRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => {
          onRowsPerPageChange(parseInt(e.target.value, 10));
          onPageChange(0);
        }}
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
