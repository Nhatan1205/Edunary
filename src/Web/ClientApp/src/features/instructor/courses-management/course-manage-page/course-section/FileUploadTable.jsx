import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";

function FileUploadTable({ fileInfo }) {
  if (!fileInfo) return null;

  return (
    <Box>
      <TableContainer sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{fileInfo.fileName}</TableCell>
              <TableCell>{fileInfo.type || "File"}</TableCell>
              <TableCell>{fileInfo.status}</TableCell>
              <TableCell>{fileInfo.uploadDate}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {fileInfo.showProgress && (
          <LinearProgress 
            sx={{ 
              height: 2,
              "& .MuiLinearProgress-bar": {
                bgcolor: "brand.main"
              }
            }} 
          />
        )}
      </TableContainer>
    </Box>
  );
}

export default FileUploadTable;
