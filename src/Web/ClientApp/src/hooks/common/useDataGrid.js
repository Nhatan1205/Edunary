import { useState, useCallback } from "react";

/**
 * Custom hook that manages all DataGrid table state:
 * pagination, sorting, row selection.
 *
 * @param {Object} options
 * @param {string} options.defaultOrderBy - Default sort column (default: "name")
 * @param {string} options.defaultOrder   - Default sort direction (default: "asc")
 * @param {number} options.defaultRowsPerPage - Default rows per page (default: 5)
 */
function useDataGrid(options = {}) {
    const {
        defaultOrderBy = "name",
        defaultOrder = "asc",
        defaultRowsPerPage = 5,
    } = options;

    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState(defaultOrderBy);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [selected, setSelected] = useState([]);
    const [order, setOrder] = useState(defaultOrder);

    const onSort = useCallback(
        (id) => {
            const isAsc = orderBy === id && order === "asc";
            setOrder(isAsc ? "desc" : "asc");
            setOrderBy(id);
        },
        [order, orderBy]
    );

    const onSelectAllRows = useCallback((checked, newSelecteds) => {
        if (checked) {
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    }, []);

    const onSelectRow = useCallback(
        (inputValue) => {
            const newSelected = selected.includes(inputValue)
                ? selected.filter((value) => value !== inputValue)
                : [...selected, inputValue];

            setSelected(newSelected);
        },
        [selected]
    );

    const onResetPage = useCallback(() => {
        setPage(0);
    }, []);

    const onChangePage = useCallback((_event, newPage) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback(
        (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            onResetPage();
        },
        [onResetPage]
    );

    const onClearSelected = useCallback(() => {
        setSelected([]);
    }, []);

    return {
        page,
        order,
        onSort,
        orderBy,
        selected,
        rowsPerPage,
        onSelectRow,
        onResetPage,
        onChangePage,
        onSelectAllRows,
        onChangeRowsPerPage,
        onClearSelected,
    };
}

export default useDataGrid;
