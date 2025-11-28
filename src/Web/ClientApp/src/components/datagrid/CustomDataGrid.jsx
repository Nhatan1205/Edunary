import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

function CustomDataGrid({ 
  rows = [],
  columns = [],
  loading = false,
  checkboxSelection = false,
  onSelectionChange = null,
  onRowClick = null,
  height = 400,
}) {

  return (
    <Paper sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={onSelectionChange}
        onRowClick={onRowClick}
        disableRowSelectionOnClick
        loading={loading}
        hideFooter
        sx={{
          border: 0,
          // Căn giữa nội dung cells
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 2,
            paddingRight: 2,
          },
          // Đảm bảo chiều cao đồng nhất
          '& .MuiDataGrid-row': {
            minHeight: '52px !important',
            maxHeight: '52px !important',
          },
          // Padding cho cell đầu tiên
          '& .MuiDataGrid-cell:first-of-type': {
            paddingLeft: 3,
          },
          '& .MuiDataGrid-columnHeader:first-of-type': {
            paddingLeft: 3,
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          }
        }}
      />
    </Paper>
  );
}

export default CustomDataGrid;