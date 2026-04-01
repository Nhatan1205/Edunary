import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
} from "@mui/material";

// Helper function to convert status enum to human-readable text
const getStatusDisplay = (status) => {
  const statusMap = {
    INITIATED: { label: "Preparing", color: "info" },
    IN_PROGRESS: { label: "Uploading", color: "warning" },
    COMPLETED: { label: "Done", color: "success" },
    FAILED: { label: "Failed", color: "error" },
    EXPIRED: { label: "Expired", color: "error" },
  };

  return statusMap[status] || { label: status || "Unknown", color: "default" };
};

function FileUploadTable({ fileInfo }) {
  if (!fileInfo) return null;

  // Calculate progress percentage
  const progressPercentage =
    fileInfo.totalChunks && fileInfo.uploadedChunks !== undefined
      ? (fileInfo.uploadedChunks / fileInfo.totalChunks) * 100
      : fileInfo.progressPercentage || 0;

  const statusInfo = getStatusDisplay(fileInfo.status);

  return (
    <Box>
      <TableContainer sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Filename</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{fileInfo.fileName}</TableCell>
              <TableCell>{fileInfo.type || "File"}</TableCell>
              <TableCell>
                <Chip
                  label={statusInfo.label}
                  size="small"
                  color={statusInfo.color}
                  variant="filled"
                />
              </TableCell>
              <TableCell>
                {fileInfo.showProgress ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: (theme) => theme.palette.divider,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "brand.main",
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35, fontSize: "0.75rem", fontWeight: 600 }}>
                      {Math.round(progressPercentage)}%
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>—</Box>
                )}
              </TableCell>
              <TableCell>{fileInfo.uploadDate}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default FileUploadTable;
