import { useState, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import useDebounce from "../../../../hooks/common/useDebounce";
import useAdminGetUsers from "../../../../hooks/user-hooks/useAdminGetUsers";
import useAdminGetUserStatusCounts from "../../../../hooks/user-hooks/useAdminGetUserStatusCounts";
import useAdminAddUser from "../../../../hooks/user-hooks/useAdminAddUser";
import useAdminBanUser from "../../../../hooks/user-hooks/useAdminBanUser";
import useAdminSuspendUser from "../../../../hooks/user-hooks/useAdminSuspendUser";
import useAdminUnbanUser from "../../../../hooks/user-hooks/useAdminUnbanUser";
import useAdminChangeUserRole from "../../../../hooks/user-hooks/useAdminChangeUserRole";
import UserDataGrid from "./components/UserDataGrid";
import AddUserDialog from "./components/AddUserDialog";
import ChangeRoleDialog from "./components/ChangeRoleDialog";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

// ── Shared styles ──────────────────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────────

function UserPage() {
    //search states
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    //pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    //filter & sort states
    const [activeTab, setActiveTab] = useState("All");   // "All" | "Active" | "Inactive" | "Suspended" | "Banned"
    const [roleFilter, setRoleFilter] = useState("");    // "" | "User" | "Administrator"
    const [sortBy, setSortBy] = useState("newest");      // "newest" | "name" | "lastLogin"


    const { data, isLoading, isError } = useAdminGetUsers(
        debouncedSearch,
        roleFilter || null,
        activeTab === "All" ? null : activeTab,
        sortBy,
        page + 1,
        rowsPerPage
    );

    // ── Counts ổn định cho Status Tabs ────────────────────────────────────────
    // Hook riêng, không phụ thuộc vào search/filter
    // Chỉ re-fetch khi ban/unban/add user (invalidate queryKey "admin-user-status-counts")
    const { data: statusCountsData } = useAdminGetUserStatusCounts();

    const handleSearchChange = useCallback((value) => {
        setSearchText(value);
        setPage(0);
    }, []);

    const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);
    const handleChangeRowsPerPage = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    const handleTabChange = useCallback((val) => { setActiveTab(val); setPage(0); }, []);
    const handleRoleChange = useCallback((val) => { setRoleFilter(val); setPage(0); }, []);
    const handleSortChange = useCallback((val) => { setSortBy(val); setPage(0); }, []);

    // ── Add User dialog ─────────────────────────────────────────────────────────────
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const { mutate: addUser, isPending: isAdding } = useAdminAddUser();

    // ── Mutations ─────────────────────────────────────────────────────────────
    const { mutate: banUser } = useAdminBanUser();
    const { mutate: suspendUser } = useAdminSuspendUser();
    const { mutate: unbanUser } = useAdminUnbanUser();
    const { mutate: changeRole, isPending: isChangingRole } = useAdminChangeUserRole();

    // ── Change Role dialog ──────────────────────────────────────────────────────
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUserForRole, setSelectedUserForRole] = useState(null);

    // ── Confirm dialog (dùng chung cho ban / unban / suspend) ──────────────────
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", action: null });
    const openConfirm = useCallback((title, message, action) => {
        setConfirmDialog({ open: true, title, message, action });
    }, []);
    const closeConfirm = useCallback(() => {
        setConfirmDialog((prev) => ({ ...prev, open: false, action: null }));
    }, []);
    const handleConfirm = useCallback(() => {
        confirmDialog.action?.();
        closeConfirm();
    }, [confirmDialog, closeConfirm]);

    // ── Action handlers ─────────────────────────────────────────────────────────────
    const handleBan = useCallback((row) => {
        openConfirm(
            "Ban User",
            `Are you sure you want to ban "${row.fullName}"? They will no longer be able to log in.`,
            () => banUser({ userId: row.id, fullName: row.fullName })
        );
    }, [banUser, openConfirm]);

    const handleUnban = useCallback((row) => {
        openConfirm(
            "Unban User",
            `Are you sure you want to unban "${row.fullName}"? Their account will be restored.`,
            () => unbanUser({ userId: row.id, fullName: row.fullName })
        );
    }, [unbanUser, openConfirm]);

    const handleSuspend = useCallback((row) => {
        openConfirm(
            "Suspend User",
            `Are you sure you want to suspend "${row.fullName}" for 7 days?`,
            () => suspendUser({ userId: row.id, fullName: row.fullName, durationDays: 7 })
        );
    }, [suspendUser, openConfirm]);

    const handleChangeRole = useCallback((row) => {
        setSelectedUserForRole(row);
        setRoleDialogOpen(true);
    }, []);

    const handleChangeRoleSave = useCallback(({ newRole }) => {
        changeRole(
            { userId: selectedUserForRole.id, fullName: selectedUserForRole.fullName, newRole },
            { onSuccess: () => setRoleDialogOpen(false) }
        );
    }, [changeRole, selectedUserForRole]);

    const handleViewDetail = useCallback((row) => { console.log("View detail:", row.id); }, []);
    const handleAddUser = useCallback(() => setAddDialogOpen(true), []);
    const handleAddUserSave = useCallback((data) => {
        addUser(data, { onSuccess: () => setAddDialogOpen(false) });
    }, [addUser]);

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            {/* ── Header ── */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <PageTitle title="User Management" />
            </Box>

            {/* ── Breadcrumbs ── */}
            <CustomBreadcrumbs />

            {/* ── Section header + Add User button ── */}
            <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Users list
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAddUser}
                    sx={addBtnSx}
                    id="add-user-btn"
                >
                    Add user
                </Button>
            </Box>

            {/* ── DataGrid ── */}
            <UserDataGrid
                // Data từ API (thay thế mock data)
                items={data?.items ?? []}
                totalCount={data?.totalCount ?? 0}
                isLoading={isLoading}
                isError={isError}

                // Counts ổn định — không bị ảnh hưởng search/filter
                statusCounts={statusCountsData ?? null}

                // Pagination
                page={page}
                rowsPerPage={rowsPerPage}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}

                // Search
                searchText={searchText}
                onSearchChange={handleSearchChange}

                // Filters lifted up — DataGrid chỉ hiển thị UI, state ở UserPage
                activeTab={activeTab}
                onTabChange={handleTabChange}
                roleFilter={roleFilter}
                onRoleChange={handleRoleChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}

                // Actions
                onBan={handleBan}
                onUnban={handleUnban}
                onSuspend={handleSuspend}
                onChangeRole={handleChangeRole}
                onViewDetail={handleViewDetail}
            />

            <Box sx={{ height: 80 }} />

            {/* ── Change Role Dialog ── */}
            <ChangeRoleDialog
                open={roleDialogOpen}
                onClose={() => setRoleDialogOpen(false)}
                onSave={handleChangeRoleSave}
                isSaving={isChangingRole}
                user={selectedUserForRole}
            />

            {/* ── Add User Dialog ── */}
            <AddUserDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onSave={handleAddUserSave}
                isSaving={isAdding}
            />

            {/* ── Confirm Dialog (ban / unban / suspend) ── */}
            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
            />
        </Box>
    );
}

export default UserPage;
