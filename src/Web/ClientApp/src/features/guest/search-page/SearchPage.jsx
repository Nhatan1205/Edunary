import { Box } from "@mui/material";
import SearchHeader from "./SearchHeader";
import { Container } from "reactstrap";
import SearchSection from "./search-section/SearchSection";
import { useSearchParams } from "react-router";
import NoResult from "../../../components/NoResult";
import FilterToolBar from "./FilterToolBar";
import useGetCourses from "../../../hooks/useGetCourses";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const { data: coursesData, isLoading: isCourseDataLoading } = useGetCourses(decodeURIComponent(query));

  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
        <Container className="my-4">
            <SearchHeader title={query} resultCount={coursesData?.length || 0} />
            <FilterToolBar />
            <SearchSection coursesData={coursesData?.items} isLoading={isCourseDataLoading}/>
            {(coursesData?.items?.length === 0) && <NoResult searchValue={query} sx={{mt: "80px",mb:"120px"}}/>}
        </Container>
    </Box>
  )
}

export default SearchPage;
