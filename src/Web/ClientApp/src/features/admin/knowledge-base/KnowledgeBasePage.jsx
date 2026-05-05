import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  LinearProgress,
  Alert,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import DataGridHead from "../../../components/datagrid/DataGridHead";
import DataGridSkeletonRow from "../../../components/datagrid/DataGridSkeletonRow";
import DataGridNoData from "../../../components/datagrid/DataGridNoData";
import useGetKnowledgeDocuments from "../../../hooks/knowledge-base-hooks/useGetKnowledgeDocuments";
import useUploadKnowledgeDocument from "../../../hooks/knowledge-base-hooks/useUploadKnowledgeDocument";
import useDeleteKnowledgeDocument from "../../../hooks/knowledge-base-hooks/useDeleteKnowledgeDocument";

import UploadDialog from "./components/UploadDialog";
import DocumentRow from "./components/DocumentRow";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEAD_LABEL = [
  { id: "fileName",        label: "File",       minWidth: 240 },
  { id: "contentType",     label: "Type",       width: 80  },
  { id: "status",          label: "Status",     width: 110 },
  { id: "chunkCount",      label: "Chunks",     width: 80  },
  { id: "qdrantCollection",label: "Collection", width: 140 },
  { id: "created",         label: "Uploaded",   width: 150 },
];

const cardSx = {
  borderRadius: "16px",
  bgcolor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
  overflow: "clip",
};

const addBtnSx = {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function KnowledgeBasePage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Server-side pagination: page is 0-based in MUI, 1-based in API
  const { data, isLoading } = useGetKnowledgeDocuments(page + 1, rowsPerPage);
  const { mutate: uploadDocument, isPending: isUploading } = useUploadKnowledgeDocument();
  const { mutate: deleteDocument } = useDeleteKnowledgeDocument();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);
  const handleChangeRowsPerPage = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const hasPending = items.some((d) => d.status === "Pending" || d.status === "Processing");

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle title="Knowledge Base" />
      </Box>

      <CustomBreadcrumbs />

      {/* ── Section header + Upload button ── */}
      <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Documents list
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={() => setUploadOpen(true)}
          sx={addBtnSx}
          id="upload-document-btn"
        >
          Upload Document
        </Button>
      </Box>

      {/* ── Info notice ── */}
      <Alert severity="info" sx={{ mb: 2, borderRadius: "12px" }}>
        Documents are embedded into the <strong>edunary_docs</strong> Qdrant collection and used by the AI chatbot for RAG responses.
        Accepted: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.md</strong> — max 10 MB.
        {hasPending && " Some documents are still being processed."}
      </Alert>

      {/* ── Table ── */}
      <Card sx={cardSx}>
        {hasPending && <LinearProgress sx={{ height: 2 }} />}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 780 }}>
            <DataGridHead
              order="asc"
              orderBy=""
              rowCount={items.length}
              numSelected={0}
              onSort={() => {}}
              onSelectAllRows={() => {}}
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

              {!isLoading && items.map((doc, i) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  index={page * rowsPerPage + i + 1}
                  onDelete={deleteDocument}
                />
              ))}

              {!isLoading && totalCount === 0 && (
                <DataGridNoData searchQuery="" colSpan={HEAD_LABEL.length + 2} />
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
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #F3F4F6",
            "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem", color: "#6B7280", mb: 0 },
            "& .MuiTablePagination-select": { fontSize: "0.8rem" },
          }}
        />
      </Card>

      {/* ── Upload Dialog ── */}
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={uploadDocument}
        isUploading={isUploading}
      />

      <Box sx={{ height: 80 }} />
    </Box>
  );
}

export default KnowledgeBasePage;

