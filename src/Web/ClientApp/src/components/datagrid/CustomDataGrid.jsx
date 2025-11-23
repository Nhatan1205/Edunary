import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

function CustomDataGrid({ 
  rows = [],
  columns = [],
  loading = false,
  pageSize = 6,
  pageNumber = 1,
  totalCount = 0,
  checkboxSelection = false,
  onSelectionChange = null,
  onPaginationChange = null,
  height = 400,
}) {

  const handlePaginationModelChange = (newModel) => {
    if (onPaginationChange) {
      // DataGrid uses 0-based page index, but your API uses 1-based
      onPaginationChange({
        pageNumber: newModel.page + 1,
        pageSize: newModel.pageSize
      });
    }
  };

  return (
    <Paper sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        // Server-side pagination
        paginationMode="server"
        rowCount={totalCount}
        paginationModel={{
          page: pageNumber - 1,
          pageSize: pageSize,
        }}
        onPaginationModelChange={handlePaginationModelChange}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={onSelectionChange}
        disableRowSelectionOnClick
        loading={loading}
        sx={{ 
          border: 0,
          '& .MuiDataGrid-footerContainer': {
            justifyContent: 'space-between',
            minHeight: 52,
          },
          '& .MuiDataGrid-selectedRowCount': {
            visibility: 'visible',
          },
          '& .MuiTablePagination-root': {
            overflow: 'visible',
          },
          "& .MuiTablePagination-displayedRows": {
            marginBottom: 0,
          },
        }}
      />
    </Paper>
  );
}

export default CustomDataGrid;