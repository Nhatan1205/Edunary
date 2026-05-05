import { useCallback, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableContainer,
  Alert,
  Tabs,
  Tab,
  TablePagination,
} from "@mui/material";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";

import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import DataGridHead from "../../../components/datagrid/DataGridHead";
import DataGridSkeletonRow from "../../../components/datagrid/DataGridSkeletonRow";
import DataGridNoData from "../../../components/datagrid/DataGridNoData";
import DataGridToolbar from "../../../components/datagrid/DataGridToolbar";

import useBatchEmbedCourses from "../../../hooks/course-embedding-hooks/useBatchEmbedCourses";
import useGetCourseEmbeddingSyncStatus from "../../../hooks/course-embedding-hooks/useGetCourseEmbeddingSyncStatus";
import useEmbedSingleCourse from "../../../hooks/course-embedding-hooks/useEmbedSingleCourse";
import useDeleteCourseEmbedding from "../../../hooks/course-embedding-hooks/useDeleteCourseEmbedding";
import useDebounce from "../../../hooks/common/useDebounce";

import EmbeddingStatsBar from "./components/EmbeddingStatsBar";
import CourseEmbeddingRow from "./components/CourseEmbeddingRow";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEAD_LABEL = [
  { id: "id", label: "ID", width: 72 },
  { id: "title", label: "Course", minWidth: 240 },
  { id: "instructorName", label: "Instructor", width: 160 },
  { id: "status", label: "Embedding", width: 130 },
];

const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "clip",
};

const primaryBtnSx = {
  bgcolor: "brand.main",
  color: "#fff",
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  borderRadius: "10px",
  px: 2.5,
  py: 1,
  boxShadow: "none",
  "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
};

const outlineBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  borderRadius: "10px",
  px: 2,
  py: 1,
  boxShadow: "none",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_TABS = ["All", "Embedded", "Missing"];
const STATUS_TAB_COLOR = {
  Embedded: { color: "success.darker", bgcolor: "success.lighter" },
  Missing: { color: "warning.dark", bgcolor: "warning.lighter" },
};

function EmbeddingStatusTabs({ activeTab, onChange, counts }) {
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
                          : { bgcolor: "grey.200", color: "text.secondary" }),
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

function CourseEmbeddingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // "All" | "Embedded" | "Missing"
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useDebounce(search, 600);

  const { data: syncData, isLoading: isSyncLoading, isFetching, refetch } =
    useGetCourseEmbeddingSyncStatus(debouncedSearch, filter, page + 1, rowsPerPage);

  const { mutate: batchEmbed, isPending: isBatching } = useBatchEmbedCourses();
  const { mutate: embedSingle } = useEmbedSingleCourse();
  const { mutate: deleteEmbedding } = useDeleteCourseEmbedding();

  // Rows come directly from the server — no client-side filtering needed
  const rows = syncData?.result?.data?.items ?? [];

  const handleFilterChange = useCallback((_, val) => {
    if (val !== null) { setFilter(val); setPage(0); }
  }, []);

  const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);
  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const totalCount    = syncData?.result?.data?.totalCount ?? 0;
  const totalEmbedded = syncData?.result?.totalEmbedded ?? 0;
  const missingCount  = syncData?.result?.totalMissing ?? 0;

  const tabCounts = {
    All:      syncData?.result?.totalPublicCourses ?? 0,
    Embedded: totalEmbedded,
    Missing:  missingCount,
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle title="Course Embeddings" />
      </Box>
      <CustomBreadcrumbs />

      {/* ── Section header ── */}
      <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Embedding Manager
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AutoFixHighOutlinedIcon />}
            onClick={() => batchEmbed()}
            disabled={isBatching}
            id="batch-embed-btn"
            sx={primaryBtnSx}
          >
            {isBatching ? "Enqueuing…" : "Re-index All Courses"}
          </Button>
        </Box>
      </Box>

      {/* ── Stats bar ── */}
      <EmbeddingStatsBar syncData={syncData} isLoading={isSyncLoading} />

      {/* ── Alert for missing ── */}
      {!isSyncLoading && missingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px" }}>
          <strong>{missingCount} course{missingCount > 1 ? "s" : ""}</strong> are Public but not yet embedded.
          Click <strong>Re-index All Courses</strong> to fix this automatically, or embed them individually below.
        </Alert>
      )}
      {!isSyncLoading && missingCount === 0 && totalCount > 0 && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }}>
          All Public courses are embedded and up to date
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2, borderRadius: "12px" }}>
        Courses are embedded into the <strong>edunary_courses</strong> Qdrant collection and used by the AI chatbot for semantic course recommendations.
        Embeddings auto-update when a course is created, updated, or deleted.
      </Alert>

      {/* ── Table ── */}
      <Card sx={cardSx}>
        {/* ── Status Tabs ── */}
        <EmbeddingStatusTabs activeTab={filter} onChange={(val) => { if (val !== null) setFilter(val); }} counts={tabCounts} />

        {/* ── Toolbar: Search + Refresh + Filter icon ── */}
        <DataGridToolbar
          filterName={search}
          onFilterName={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by ID or title..."
          onRefresh={refetch}
          isRefreshing={isSyncLoading}
        />
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 680 }}>
            <DataGridHead
              order="asc"
              orderBy=""
              rowCount={rows.length}
              numSelected={0}
              onSort={() => { }}
              onSelectAllRows={() => { }}
              headLabel={HEAD_LABEL}
              showCheckbox={false}
              showIndex={true}
              showActions={true}
            />
            <TableBody>
              {isSyncLoading &&
                Array.from({ length: rowsPerPage }).map((_, i) => (
                  <DataGridSkeletonRow
                    key={i}
                    colCount={HEAD_LABEL.length}
                    showCheckbox={false}
                    showIndex={true}
                    showActions={true}
                  />
                ))}

              {!isSyncLoading &&
                rows.map((course, i) => (
                  <CourseEmbeddingRow
                    key={course.courseId}
                    course={course}
                    index={page * rowsPerPage + i + 1}
                    isEmbedded={course.isEmbedded}
                    onEmbed={embedSingle}
                    onDelete={deleteEmbedding}
                  />
                ))}

              {!isSyncLoading && rows.length === 0 && (
                <DataGridNoData searchQuery={search} colSpan={HEAD_LABEL.length + 2} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          page={page}
          count={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #F3F4F6",
            "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem", color: "#6B7280", mb: 0 },
            "& .MuiTablePagination-select": { fontSize: "0.8rem" },
          }}
        />
      </Card>

      <Box sx={{ height: 80 }} />
    </Box>
  );
}

export default CourseEmbeddingPage;
