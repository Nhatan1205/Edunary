import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
} from "@mui/material";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import DataGridToolbar from "../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../components/datagrid/DataGridHead";
import DataGridSkeletonRow from "../../../../components/datagrid/DataGridSkeletonRow";
import DataGridNoData from "../../../../components/datagrid/DataGridNoData";
import DataGridRow from "../../../../components/datagrid/DataGridRow";
import useDataGrid from "../../../../hooks/common/useDataGrid";
import useDebounce from "../../../../hooks/common/useDebounce";
import useGetQdrantCollections from "../../../../hooks/qdrant-dashboard-hooks/useGetQdrantCollections";
import useDeleteQdrantCollection from "../../../../hooks/qdrant-dashboard-hooks/useDeleteQdrantCollection";
import DeleteCollectionDialog from "./DeleteCollectionDialog";
import StatusChip from "./StatusChip";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "clip",
};

const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

const COLLECTIONS_HEAD = [
  { id: "name", label: "Collection", minWidth: 200 },
  { id: "status", label: "Status", width: 110 },
  { id: "pointsCount", label: "Points", width: 110 },
  { id: "vectorSize", label: "Dimension", width: 110 },
  { id: "distance", label: "Distance", width: 120 },
  { id: "segmentsCount", label: "Segments", width: 100 },
];

const formatNumber = (n) => (n == null ? "—" : Number(n).toLocaleString());

function CollectionsTable({ onSelect }) {
  const { data, isLoading, isFetching, refetch } = useGetQdrantCollections();

  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { mutate: deleteCollection } = useDeleteQdrantCollection();
  const table = useDataGrid({ defaultOrderBy: "name" });

  const allCollections = data?.collections ?? [];

  // Client-side search filter (collection list is small)
  const filtered = allCollections.filter((c) =>
    !debouncedSearch || c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const notFound = !isLoading && filtered.length === 0 && !!debouncedSearch;

  const handleSearchChange = (e) => { setSearchText(e.target.value); setPage(0); };
  const handleChangePage = useCallback((_, p) => setPage(p), []);
  const handleChangeRows = useCallback((e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }, []);

  // Pass the full summary object so CollectionDetail can use it without re-fetching
  const actionItems = (col) => [
    {
      label: "Browse Points",
      icon: <StorageOutlinedIcon sx={{ fontSize: 16 }} />,
      onClick: () => onSelect(col),
    },
    {
      label: "Delete",
      icon: <DeleteOutlineIcon sx={{ fontSize: 16 }} />,
      onClick: () => setDeleteTarget(col.name),
      color: "error.main",
    },
  ];

  return (
    <>
      <Card sx={cardSx}>
        <DataGridToolbar
          filterName={searchText}
          onFilterName={handleSearchChange}
          searchPlaceholder="Search collection name..."
          onRefresh={refetch}
          isRefreshing={isFetching && !isLoading}
        />

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 720 }}>
            <DataGridHead
              order={table.order}
              orderBy={table.orderBy}
              rowCount={paginated.length}
              numSelected={0}
              onSort={table.onSort}
              onSelectAllRows={() => { }}
              headLabel={COLLECTIONS_HEAD}
              showCheckbox={false}
              showIndex={true}
              showActions={true}
            />
            <TableBody>
              {isLoading && Array.from({ length: rowsPerPage }).map((_, i) => (
                <DataGridSkeletonRow
                  key={i}
                  colCount={COLLECTIONS_HEAD.length}
                  showCheckbox={false}
                  showIndex={true}
                  showActions={true}
                />
              ))}

              {!isLoading && paginated.map((col, i) => (
                <DataGridRow
                  key={col.name}
                  selected={false}
                  onSelectRow={() => { }}
                  showCheckbox={false}
                  showIndex={true}
                  rowIndex={page * rowsPerPage + i + 1}
                  actionItems={actionItems(col)}
                  row={col}
                  viewLink={null}
                >
                  {/* Collection name */}
                  <TableCell sx={{ ...bCell, py: "10px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <StorageOutlinedIcon sx={{ color: "brand.main", fontSize: 20, flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="brand.main"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => onSelect(col)}
                      >
                        {col.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={bCell}><StatusChip status={col.status} /></TableCell>
                  <TableCell sx={bCell}>{formatNumber(col.pointsCount)}</TableCell>
                  <TableCell sx={bCell}>{col.vectorSize ?? "—"}</TableCell>
                  <TableCell sx={bCell}>
                    <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                      {col.distance ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={bCell}>{col.segmentsCount ?? "—"}</TableCell>
                </DataGridRow>
              ))}

              {!isLoading && allCollections.length === 0 && (
                <DataGridNoData searchQuery="" colSpan={COLLECTIONS_HEAD.length + 2} />
              )}
              {notFound && <DataGridNoData searchQuery={debouncedSearch} colSpan={COLLECTIONS_HEAD.length + 2} />}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          page={page}
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onRowsPerPageChange={handleChangeRows}
          sx={{
            borderTop: "1px solid #F3F4F6",
            "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem", color: "#6B7280", mb: 0 },
            "& .MuiTablePagination-select": { fontSize: "0.8rem" },
          }}
        />
      </Card>

      <DeleteCollectionDialog
        open={!!deleteTarget}
        collectionName={deleteTarget ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteCollection(deleteTarget); setDeleteTarget(null); }}
      />
    </>
  );
}

export default CollectionsTable;
