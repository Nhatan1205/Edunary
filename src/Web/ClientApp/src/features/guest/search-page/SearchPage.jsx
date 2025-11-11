import { Box } from "@mui/material";
import SearchHeader from "./SearchHeader";
import { Container } from "reactstrap";
import SearchSection from "./search-section/SearchSection";

function SearchPage() {
  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
        <Container>
            <SearchHeader title="llm" resultCount={30} />
            <SearchSection />
        </Container>
    </Box>
  )
}

export default SearchPage;
