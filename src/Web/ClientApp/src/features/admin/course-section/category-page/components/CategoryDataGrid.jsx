import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import useDataGrid from "../../../../../hooks/common/useDataGrid";

import DataGridToolbar from "../../../../../components/datagrid/DataGridToolbar";
import DataGridHead from "../../../../../components/datagrid/DataGridHead";
import DataGridRow from "../../../../../components/datagrid/DataGridRow";
import DataGridNoData from "../../../../../components/datagrid/DataGridNoData";

import DataGridSkeletonRow from "../../../../../components/datagrid/DataGridSkeletonRow";
import { formatShortDate } from "../../../../../utils/helpers";

import {
    Typography, Card, Table, TableBody, TableCell,
    TableContainer, TablePagination
} from "@mui/material";

const cardSx = {
    borderRadius: "16px",
    bgcolor: "#FFFFFF",
    border: "1px solid #E5E7EB",
    boxShadow: "0px 1px 3px rgba(16,24,40,0.06), 0px 4px 8px rgba(16,24,40,0.04)",
    overflow: "hidden",
};

const HEAD_LABEL = [
    { id: "title", label: "Category Name", width: "35%" },
    { id: "courseCount", label: "Courses", width: 120 },
    { id: "enrollmentCount", label: "Enrollments", width: 140 },
    { id: "created", label: "Created Date", align: "center", width: 180 },
];

function CategoryDataGrid({ onEdit, onDelete, searchText, onSearchChange, page, rowsPerPage, onChangePage, onChangeRowsPerPage, data, isLoading, onRefresh, isRefreshing }) {
    const table = useDataGrid({ defaultOrderBy: "title" });

    const items = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;
    const notFound = !isLoading && items.length === 0 && !!searchText;

    // Action menu items
    const actionItems = [
        {
            label: "Edit",
            icon: <EditIcon sx={{ fontSize: 16 }} />,
            onClick: (row) => onEdit(row),
        },
        {
            label: "Delete",
            icon: <DeleteOutlineIcon sx={{ fontSize: 16 }} />,
            onClick: (row) => onDelete(row),
            color: "error.main",
        },
    ];

    return (
        <Card sx={cardSx}>
            <DataGridToolbar
                filterName={searchText}
                onFilterName={(e) => { onSearchChange(e.target.value); }}
                searchPlaceholder="Search category..."
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
            />

            <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 560, tableLayout: "fixed" }}>
                    <DataGridHead
                        order={table.order}
                        orderBy={table.orderBy}
                        rowCount={items.length}
                        numSelected={0}
                        onSort={table.onSort}
                        onSelectAllRows={() => { }}
                        headLabel={HEAD_LABEL}
                        showCheckbox={false}
                        showIndex={true}
                        showActions={true}
                    />
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: rowsPerPage }).map((_, i) => (
                                <DataGridSkeletonRow
                                    key={i}
                                    colCount={4}
                                    showCheckbox={false}
                                    showIndex={true}
                                    showActions={true}
                                />
                            ))
                            : items.map((row, index) => (
                                <DataGridRow
                                    key={row.id}
                                    selected={false}
                                    onSelectRow={() => { }}
                                    showCheckbox={false}
                                    showIndex={true}
                                    rowIndex={page * rowsPerPage + index + 1}
                                    actionItems={actionItems}
                                    row={row}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {row.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: "#6B7280" }}>
                                        {row.courseCount}
                                    </TableCell>
                                    <TableCell sx={{ color: "#6B7280" }}>
                                        {row.enrollmentCount?.toLocaleString() ?? "0"}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "#6B7280" }}>
                                        {formatShortDate(row.created) ?? "—"}
                                    </TableCell>
                                </DataGridRow>
                            ))
                        }

                        {notFound && <DataGridNoData searchQuery={searchText} colSpan={5} />}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                page={page}
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={onChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={onChangeRowsPerPage}
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

export default CategoryDataGrid;    