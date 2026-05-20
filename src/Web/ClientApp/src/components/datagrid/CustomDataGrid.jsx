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
  rowHeight = 52,
  sx = {},
  slots = {},
}) {

  return (
    <Paper sx={{
      height, width: '100%',
      boxShadow: 'none',
      border: '1px solid #e0e0e0',
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={onSelectionChange}
        onRowClick={onRowClick}
        disableRowSelectionOnClick
        loading={loading}
        slots={slots}
        hideFooter
        rowHeight={rowHeight}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: '#555',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          },

          '& .MuiDataGrid-row': {
            minHeight: `${rowHeight}px !important`,
            maxHeight: `${rowHeight}px !important`,
            borderBottom: '1px solid #f0f0f0',
            '&:hover': {
              backgroundColor: '#fafafa',
            },
            '&:last-child': {
              borderBottom: 'none',
            },
          },

          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 2,
            paddingRight: 2,
            borderBottom: 'none',
            color: '#333',
          },

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
          },
          ...sx,
        }}
      />
    </Paper>
  );
}

export default CustomDataGrid;
