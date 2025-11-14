import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function FileLibraryTable({ contents, onSelect, onDelete }) {
  if (!contents || contents.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No files found
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getFileType = (contentType) => {
    if (!contentType) return "File";
    
    if (contentType.startsWith('video/')) return "Video";
    if (contentType.startsWith('image/')) return "Image";
    if (contentType.startsWith('audio/')) return "Audio";
    if (contentType.includes('pdf')) return "PDF";
    if (contentType.includes('word') || contentType.includes('document')) return "Document";
    if (contentType.includes('sheet') || contentType.includes('excel')) return "Spreadsheet";
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return "Presentation";
    if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('7z')) return "Archive";
    if (contentType.includes('external-link')) return "Link";
    
    return "File";
  };

  return (
    <TableContainer sx={{ maxHeight: 300, border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Filename</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", width: 120 }} align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((content) => {
            const isUsed = content.courseId !== null;
            
            return (
              <TableRow key={content.id}>
                <TableCell sx={{ color: isUsed ? "text.disabled" : "text.primary" }}>
                  {content.fileName}
                </TableCell>
                <TableCell sx={{ color: isUsed ? "text.disabled" : "text.primary" }}>
                  {getFileType(content.contentType)}
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: isUsed ? "text.disabled" : "success.main",
                      fontWeight: 500,
                    }}
                  >
                    Success
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: isUsed ? "text.disabled" : "text.primary" }}>
                  {formatDate(content.lastModified)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Tooltip 
                      title={isUsed ? "This file is already used in other lectures" : ""}
                      arrow
                    >
                      <span>
                        <Button
                          size="small"
                          disabled={isUsed}
                          onClick={() => onSelect(content)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: isUsed ? "text.disabled" : "brand.main",
                            minWidth: "auto",
                            fontSize: "0.875rem",
                            "&:hover": {
                              bgcolor: isUsed ? "transparent" : "brand.lighter",
                              borderColor: "brand.dark",
                            },
                          }}
                        >
                          {isUsed ? "Used" : "Select"}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip 
                      title={isUsed ? "Cannot delete - file is in use" : ""}
                      arrow
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={isUsed}
                          onClick={() => onDelete && onDelete(content)}
                          sx={{
                            color: "brand.main",
                            "&:hover": {
                              bgcolor: "brand.lighter",
                              borderColor: "brand.dark",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FileLibraryTable;
