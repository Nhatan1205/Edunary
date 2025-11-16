import { Box, Typography } from "@mui/material";
import { Container } from "reactstrap";

function SearchHeader({ title, resultCount }) {
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
          {title && title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          <span style={{ fontWeight: 600 }}>{resultCount}</span> {resultCount === 1 ? 'Result' : 'Results'}
        </Typography>
      </Box>
    </Container>
  );
}

export default SearchHeader;
