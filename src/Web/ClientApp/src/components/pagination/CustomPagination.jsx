import { Box, Pagination } from "@mui/material";

function CustomPagination({ count = 0, page = 1, onChange }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        siblingCount={1}
        boundaryCount={0}
        shape="rounded"
        sx={{
          '& .MuiPaginationItem-root': {
            fontSize: '16px',
            fontWeight: 600,
            color: '#9CA3AF',
            borderRadius: '8px',
            minWidth: '32px',
            height: '32px',
            '&:hover': {
              backgroundColor: 'background.muted',
            },
            '&.Mui-selected': {
              backgroundColor: 'transparent',
              color: 'brand.main',
              borderBottom: '2px solid',
              borderColor: "brand.main",
              borderRadius: 0,
              '&:hover': {
                backgroundColor: 'background.muted',
              },
            },
          },
          '& .MuiPaginationItem-ellipsis': {
            color: '#9CA3AF',
          },
          '& .MuiPaginationItem-previousNext': {
            border: '1.5px solid',
            borderColor: "brand.dark",
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'brand.dark',
            '&:hover': {
              backgroundColor: 'background.muted',
            },
          },
        }}
      />
    </Box>
  );
}

export default CustomPagination;