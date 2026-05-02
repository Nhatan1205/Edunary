import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Chip,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Divider,
  Collapse,
  Paper,
} from "@mui/material";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import NavigateBeforeOutlinedIcon from "@mui/icons-material/NavigateBeforeOutlined";

import DataGridHead from "../../../../components/datagrid/DataGridHead";
import DataGridSkeletonRow from "../../../../components/datagrid/DataGridSkeletonRow";
import DataGridNoData from "../../../../components/datagrid/DataGridNoData";
import DataGridRow from "../../../../components/datagrid/DataGridRow";
import useGetQdrantCollectionInfo from "../../../../hooks/qdrant-dashboard-hooks/useGetQdrantCollectionInfo";
import useGetQdrantPoints from "../../../../hooks/qdrant-dashboard-hooks/useGetQdrantPoints";
import StatusChip from "./StatusChip";

const POINTS_PAGE_SIZE = 20;

const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "clip",
};

const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

const POINTS_HEAD = [
  { id: "id", label: "Point ID", minWidth: 280 },
  { id: "payload", label: "Payload Preview", minWidth: 300 },
];

const formatNumber = (n) => (n == null ? "—" : Number(n).toLocaleString());

// ─── Point Row ────────────────────────────────────────────────────────────────

function PointRow({ point, index }) {
  const [expanded, setExpanded] = useState(false);
  const payload = point.payload || {};
  const previewKeys = Object.keys(payload).slice(0, 3);

  return (
    <>
      <DataGridRow
        selected={false}
        onSelectRow={() => { }}
        showCheckbox={false}
        showIndex={true}
        rowIndex={index}
        actionItems={[]}
        row={point}
        viewLink={null}
      >
        {/* Point ID */}
        <TableCell sx={{ ...bCell, py: "10px" }}>
          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "brand.dark", wordBreak: "break-all" }}>
            {point.id}
          </Typography>
        </TableCell>

        {/* Payload preview + expand toggle */}
        <TableCell sx={bCell}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {previewKeys.length > 0 ? (
              previewKeys.map((k) => (
                <Chip
                  key={k}
                  label={`${k}: ${String(payload[k]).slice(0, 28)}`}
                  size="small"
                  sx={{ fontSize: "0.65rem", height: 20, borderRadius: "4px", bgcolor: "background.muted", color: "text.secondary" }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                No payload data
              </Typography>
            )}
            {Object.keys(payload).length > 3 && (
              <Chip
                label={`+${Object.keys(payload).length - 3} more`}
                size="small"
                sx={{ fontSize: "0.65rem", height: 20, borderRadius: "4px", bgcolor: "grey.100", color: "text.disabled" }}
              />
            )}
            {Object.keys(payload).length > 0 && (
              <Tooltip title={expanded ? "Collapse" : "Expand payload"}>
                <IconButton size="small" onClick={() => setExpanded((p) => !p)} sx={{ color: "text.secondary", ml: "auto" }}>
                  {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </DataGridRow>

      {/* Expanded JSON row */}
      <tr>
        <td colSpan={4} style={{ padding: 0, borderBottom: "none" }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 1.5 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5, borderRadius: "8px", bgcolor: "#F9FAFB",
                  fontFamily: "monospace", fontSize: "0.75rem",
                  whiteSpace: "pre-wrap", wordBreak: "break-all",
                  color: "text.secondary", maxHeight: 260, overflowY: "auto",
                }}
              >
                {JSON.stringify(payload, null, 2)}
              </Paper>
            </Box>
          </Collapse>
        </td>
      </tr>
    </>
  );
}

// ─── Collection Detail View ───────────────────────────────────────────────────

function CollectionDetail({ summary, onBack }) {
  const name = summary.name;

  // Fetch only the EXTRA fields not already in the summary
  const { data: extInfo, isLoading: extLoading } = useGetQdrantCollectionInfo(name);

  const [offsetStack, setOffsetStack] = useState([null]);
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ key: null, value: null });

  const currentOffset = offsetStack[offsetStack.length - 1];

  const { data: pointsData, isLoading: pointsLoading, isFetching: pointsFetching, refetch: refetchPoints } = useGetQdrantPoints(name, {
    limit: POINTS_PAGE_SIZE,
    offset: currentOffset,
    filterKey: appliedFilter.key,
    filterValue: appliedFilter.value,
  });

  const points = pointsData?.points ?? [];
  const nextOffset = pointsData?.nextOffset ?? null;

  const handleApplyFilter = () => { setOffsetStack([null]); setAppliedFilter({ key: filterKey || null, value: filterValue || null }); };
  const handleClearFilter = () => { setFilterKey(""); setFilterValue(""); setOffsetStack([null]); setAppliedFilter({ key: null, value: null }); };
  const handleNext = () => { if (nextOffset) setOffsetStack((p) => [...p, nextOffset]); };
  const handlePrev = () => { if (offsetStack.length > 1) setOffsetStack((p) => p.slice(0, -1)); };

  const isFirstPage = offsetStack.length === 1;

  return (
    <Box>
      {/* Back nav */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton size="small" onClick={onBack} sx={{ color: "text.secondary" }}>
          <ArrowBackOutlinedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary">All Collections /</Typography>
        <Typography variant="body2" fontWeight={700} color="text.primary">{name}</Typography>
      </Box>

      {/* Stats strip — uses summary data immediately, no loading state needed */}
      <Card sx={{ ...cardSx, p: 2.5, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <StorageOutlinedIcon sx={{ color: "brand.main", fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700}>{name}</Typography>
          <StatusChip status={summary.status} />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[
            ["Total Points", formatNumber(summary.pointsCount)],
            ["Vector Size", summary.vectorSize ?? "—"],
            ["Distance", summary.distance ?? "—"],
            ["Segments", summary.segmentsCount ?? "—"],
            // Extended fields — only available after the detail fetch
            ["Indexed Vectors", extLoading ? "…" : formatNumber(extInfo?.indexedVectorsCount)],
            ["Optimizer", extLoading ? "…" : (extInfo?.optimizerStatus?.status ?? "ok")],
          ].map(([label, val]) => (
            <Box key={label}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>{label}</Typography>
              <Typography variant="body2" fontWeight={600}>{val}</Typography>
            </Box>
          ))}
        </Box>
        {/* Payload indexes — only from extended fetch */}
        {!extLoading && extInfo?.payloadSchema && Object.keys(extInfo.payloadSchema).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem", display: "block", mb: 0.75 }}>PAYLOAD INDEXES</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {Object.entries(extInfo.payloadSchema).map(([field, type]) => (
                <Chip key={field} label={`${field} · ${type}`} size="small"
                  sx={{ borderRadius: "6px", bgcolor: "brand.lighter", color: "brand.darker", fontWeight: 600, fontSize: "0.72rem" }} />
              ))}
            </Box>
          </Box>
        )}
      </Card>

      {/* Points browser */}
      <Card sx={cardSx}>
        {/* Filter toolbar */}
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #F3F4F6", display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="subtitle2" fontWeight={700}>Points Browser</Typography>
          <TextField
            size="small" placeholder="Filter key (e.g. metadata.file_key)"
            value={filterKey} onChange={(e) => setFilterKey(e.target.value)}
            sx={{ width: 260, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.8rem" } }}
          />
          <TextField
            size="small" placeholder="Filter value"
            value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
            sx={{ width: 180, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.8rem" } }}
          />
          <Button
            size="small" variant="contained"
            disabled={!filterKey || !filterValue}
            onClick={handleApplyFilter}
            sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
          >
            Apply
          </Button>
          {(appliedFilter.key) && (
            <Button size="small" onClick={handleClearFilter} sx={{ color: "text.secondary", textTransform: "none" }}>Clear</Button>
          )}
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Page {offsetStack.length}</Typography>
            <IconButton size="small" disabled={isFirstPage || pointsLoading} onClick={handlePrev}>
              <NavigateBeforeOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" disabled={!nextOffset || pointsLoading} onClick={handleNext}>
              <NavigateNextOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 640 }}>
            <DataGridHead
              order="asc" orderBy="" rowCount={points.length} numSelected={0}
              onSort={() => { }} onSelectAllRows={() => { }}
              headLabel={POINTS_HEAD}
              showCheckbox={false} showIndex={true} showActions={false}
            />
            <TableBody>
              {(pointsLoading || pointsFetching) && Array.from({ length: 5 }).map((_, i) => (
                <DataGridSkeletonRow key={i} colCount={POINTS_HEAD.length} showCheckbox={false} showIndex={true} showActions={false} />
              ))}

              {!pointsLoading && !pointsFetching && points.map((point, i) => (
                <PointRow
                  key={point.id}
                  point={point}
                  index={(offsetStack.length - 1) * POINTS_PAGE_SIZE + i + 1}
                />
              ))}

              {!pointsLoading && !pointsFetching && points.length === 0 && (
                <DataGridNoData
                  searchQuery={appliedFilter.key ? `${appliedFilter.key}=${appliedFilter.value}` : ""}
                  colSpan={POINTS_HEAD.length + 2}
                />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default CollectionDetail;
