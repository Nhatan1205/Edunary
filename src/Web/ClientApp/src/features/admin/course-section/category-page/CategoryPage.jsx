import { useState, useCallback } from "react";
import {
    Box, Typography, Card, Table, TableBody, TableCell,
    TableContainer, TablePagination, Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import CategoryDialog from "./components/CategoryDialog";

import useAdminGetCategories from "../../../../hooks/category-hooks/useAdminGetCategories";
import useAdminCreateCategory from "../../../../hooks/category-hooks/useAdminCreateCategory";
import useAdminUpdateCategory from "../../../../hooks/category-hooks/useAdminUpdateCategory";
import useAdminDeleteCategory from "../../../../hooks/category-hooks/useAdminDeleteCategory";
import useDebounce from "../../../../hooks/common/useDebounce";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import CategoryOverview from "./components/CategoryOverview";
import CategoryDataGrid from "./components/CategoryDataGrid";


// ── Shared styles ──────────────────────────────────────────────────────

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


function CategoryPage() {
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
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const { data, isLoading, isFetching, refetch } = useAdminGetCategories(
        debouncedSearch || null,
        page + 1,
        rowsPerPage
    );
    const createCategory = useAdminCreateCategory();
    const updateCategory = useAdminUpdateCategory();
    const deleteCategory = useAdminDeleteCategory();

    const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);
    const handleChangeRowsPerPage = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    // ── Dialog handlers ──
    const handleOpenCreate = () => {
        setDialogMode("create");
        setSelectedCategory(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (row) => {
        setDialogMode("edit");
        setSelectedCategory(row);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCategory(null);
    };

    // ── Save handler (create or update) ──
    const handleSave = (data, mode) => {
        if (mode === "create") {
            createCategory.mutate({ title: data.title }, { onSuccess: handleCloseDialog });
        } else {
            updateCategory.mutate(
                { id: selectedCategory.id, title: data.title },
                { onSuccess: handleCloseDialog }
            );
        }
    };

    // ── Delete handlers ──
    const handleOpenDelete = (row) => {
        setCategoryToDelete(row);
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setCategoryToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        deleteCategory.mutate(categoryToDelete.id, {
            onSuccess: () => setPage(0),
            onSettled: handleCloseConfirm,
        });
    };

    const isSaving = createCategory.isPending || updateCategory.isPending;

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            {/* ── Header ── */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <PageTitle title="Category Management" />
            </Box>

            {/* ── Breadcrumbs ── */}
            <CustomBreadcrumbs />

            {/* ── Overview: stat cards + comparison chart ── */}
            <Box sx={{ mt: 3 }}>
                <CategoryOverview />
            </Box>

            {/* ── Section header ── */}
            <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Categories list</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={newBtnSx}
                >
                    New Category
                </Button>
            </Box>

            {/* ── DataGrid ── */}
            <CategoryDataGrid
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
                onRefresh={refetch}
                isRefreshing={isFetching && !isLoading}
            />

            {/* ── Dialog (shared for create & edit) ── */}
            <CategoryDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                mode={dialogMode}
                category={selectedCategory}
                onSave={handleSave}
                isSaving={isSaving}
            />

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.title}"? This action cannot be undone.`}
                onClose={handleCloseConfirm}
                onConfirm={handleConfirmDelete}
            />

            <Box sx={{ height: 80 }} />
        </Box>
    );
}

export default CategoryPage;