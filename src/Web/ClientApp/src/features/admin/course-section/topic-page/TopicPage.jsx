import { useState, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useDebounce from "../../../../hooks/common/useDebounce";

import useGetCourseTopics from "../../../../hooks/course-topic-hooks/useGetCourseTopics";
import useCreateCourseTopic from "../../../../hooks/course-topic-hooks/useCreateCourseTopic";
import useUpdateCourseTopic from "../../../../hooks/course-topic-hooks/useUpdateCourseTopic";
import useDeleteCourseTopic from "../../../../hooks/course-topic-hooks/useDeleteCourseTopic";
import TopicDialog from "./components/TopicDialog";
import TopicDataGrid from "./components/TopicDataGrid";

const newBtnSx = {
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

function TopicPage() {
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 500);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleSearchChange = useCallback((value) => {
        setSearchText(value);
        setPage(0);
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [selectedTopic, setSelectedTopic] = useState(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState(null);

    const { data, isLoading, isFetching } = useGetCourseTopics(
        debouncedSearch || null,
        page + 1,
        rowsPerPage
    );

    const createTopic = useCreateCourseTopic();
    const updateTopic = useUpdateCourseTopic();
    const deleteTopic = useDeleteCourseTopic();

    const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);
    const handleChangeRowsPerPage = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    // ── Dialog handlers ──
    const handleOpenCreate = () => {
        setDialogMode("create");
        setSelectedTopic(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (row) => {
        setDialogMode("edit");
        setSelectedTopic(row);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedTopic(null);
    };

    // ── Save handler (create or update) ──
    const handleSave = (formData, mode) => {
        if (mode === "create") {
            createTopic.mutate({ name: formData.name }, { onSuccess: handleCloseDialog });
        } else {
            updateTopic.mutate(
                { id: selectedTopic.id, name: formData.name },
                { onSuccess: handleCloseDialog }
            );
        }
    };

    // ── Delete handlers ──
    const handleOpenDelete = (row) => {
        setTopicToDelete(row);
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setTopicToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!topicToDelete) return;
        deleteTopic.mutate(topicToDelete.id, {
            onSuccess: () => setPage(0),
            onSettled: handleCloseConfirm,
        });
    };

    const isSaving = createTopic.isPending || updateTopic.isPending;

    return (
        <Box sx={{ px: "240px" }}>
            {/* ── Header ── */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <PageTitle title="Topic Management" />
            </Box>

            {/* ── Breadcrumbs ── */}
            <CustomBreadcrumbs />

            {/* ── Section header ── */}
            <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Topics list</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={newBtnSx}
                >
                    New Topic
                </Button>
            </Box>

            {/* ── DataGrid ── */}
            <TopicDataGrid
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                page={page}
                rowsPerPage={rowsPerPage}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                data={data}
                isLoading={isLoading}
                isRefreshing={isFetching && !isLoading}
            />

            {/* ── Dialog (shared for create & edit) ── */}
            <TopicDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                mode={dialogMode}
                topic={selectedTopic}
                onSave={handleSave}
                isSaving={isSaving}
            />

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Topic"
                message={`Are you sure you want to delete "${topicToDelete?.name}"? This action cannot be undone.`}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmDelete}
            />

            <Box sx={{ height: 80 }} />
        </Box>
    );
}

export default TopicPage;