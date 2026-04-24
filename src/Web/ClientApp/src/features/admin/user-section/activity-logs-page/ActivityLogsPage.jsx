import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Box } from "@mui/material";
import PageTitle from "../../../../components/PageTitle";
import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import ActivityLogsDataGrid from "./components/ActivityLogsDataGrid";
import UserFilterDialog from "./components/UserFilterDialog";
import useGetActivityLogs from "../../../../hooks/activity-log-hooks/useGetActivityLogs";
import useDeleteActivityLogs from "../../../../hooks/activity-log-hooks/useDeleteActivityLogs";
import useDebounce from "../../../../hooks/common/useDebounce";

function ActivityLogsPage() {
    const { userId: urlUserId } = useParams();
    const navigate = useNavigate();

    // ── Filter state ────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [userDialogOpen, setUserDialogOpen] = useState(false);

    // Debounce search — only trigger API after user stops typing
    const debouncedSearch = useDebounce(search, 500);

    // userId: prefer selectedUser from dialog, fall back to URL param
    const filterUserId = selectedUser?.id || urlUserId || null;

    // ── Data fetching ───────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, refetch } = useGetActivityLogs({
        userId: filterUserId,
        activityTypeFilter: -1,
        search: debouncedSearch,
        from,
        to,
        sortOrder,
        pageNumber: page + 1,
        pageSize: rowsPerPage,
    });

    const deleteMutation = useDeleteActivityLogs();

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleChangePage = useCallback((_, newPage) => setPage(newPage), []);

    const handleChangeRowsPerPage = useCallback((e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    }, []);

    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        setPage(0);
    }, []);

    const handleSortChange = useCallback((value) => {
        setSortOrder(value);
        setPage(0);
    }, []);

    const handleSelectUser = useCallback((user) => {
        setSelectedUser(user);
        setUserDialogOpen(false);
        setPage(0);
        // Update URL to reflect the user filter
        navigate(`/admin/user/${user.id}/activity-logs`, { replace: true });
    }, [navigate]);

    const handleClearUserFilter = useCallback(() => {
        setSelectedUser(null);
        setPage(0);
        navigate("/admin/user/activity-logs", { replace: true });
    }, [navigate]);

    const handleFromChange = useCallback((value) => {
        setFrom(value);
        setPage(0);
    }, []);

    const handleToChange = useCallback((value) => {
        setTo(value);
        setPage(0);
    }, []);

    const handleDelete = useCallback((ids) => {
        deleteMutation.mutate(ids);
    }, [deleteMutation]);

    // Reset ALL filters to default + refetch
    const handleRefresh = useCallback(() => {
        setSearch("");
        setSortOrder("newest");
        setPage(0);
        setSelectedUser(null);
        setFrom(null);
        setTo(null);
        // If filtered by a userId, navigate back to base activity-logs
        if (urlUserId) navigate("/admin/user/activity-logs", { replace: true });
        refetch();
    }, [refetch, urlUserId, navigate]);

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            <PageTitle title="Activity Logs" />
            <CustomBreadcrumbs />

            <Box sx={{ mt: 3 }}>
                <ActivityLogsDataGrid
                    // Data
                    items={data?.items ?? []}
                    totalCount={data?.totalCount ?? 0}
                    isLoading={isLoading}

                    // Pagination
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}

                    // Filters
                    searchText={search}
                    onSearchChange={handleSearchChange}
                    sortBy={sortOrder}
                    onSortChange={handleSortChange}
                    selectedUser={selectedUser}
                    onOpenUserFilter={() => setUserDialogOpen(true)}
                    onClearUserFilter={handleClearUserFilter}
                    from={from}
                    onFromChange={handleFromChange}
                    to={to}
                    onToChange={handleToChange}

                    // Delete
                    onDelete={handleDelete}

                    // Refresh — resets all filters
                    onRefresh={handleRefresh}
                    isRefreshing={isFetching}
                />
            </Box>

            <UserFilterDialog
                open={userDialogOpen}
                onClose={() => setUserDialogOpen(false)}
                onSelectUser={handleSelectUser}
            />
        </Box>
    );
}

export default ActivityLogsPage;