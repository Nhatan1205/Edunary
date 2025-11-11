import { Box, Typography } from "@mui/material";
import { Container } from "reactstrap";

function SearchHeader({ title = "llm", resultCount = 30 }) {
  return (
    <Container fluid className="px-3 px-md-4">
      <Box sx={{ py: 3 }}>
        <Typography
          variant="h6"
          component="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            mb: 1,
            color: 'text.primary'
          }}
        >
          Result for "{title}"
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '0.75rem', md: '1rem' },
            color: 'text.primary'
          }}
        >
          <span style={{ fontWeight: 600 }}>{resultCount}</span> Results
        </Typography>
      </Box>
    </Container>
  );
}

export default SearchHeader;
