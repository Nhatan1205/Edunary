import { Box } from "@mui/material";
import SearchHeader from "./SearchHeader";
import { Container } from "reactstrap";
import SearchSection from "./search-section/SearchSection";
import { useSearchParams } from "react-router";
import useGetCoursesWithFilter from "../../../hooks/useGetCourseWithFilter";
import NoResult from "../../../components/NoResult";
import FilterToolBar from "./FilterToolBar";



function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const { data: coursesData, isLoading: isCourseDataLoading } = useGetCoursesWithFilter(decodeURIComponent(query));

  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
        <Container className="my-4">
            <SearchHeader title={query} resultCount={coursesData?.length || 0} />
            <FilterToolBar />
            <SearchSection coursesData={coursesData} isLoading={isCourseDataLoading}/>
            {!(coursesData && coursesData.length > 0) && <NoResult searchValue={query} sx={{mt: "80px",mb:"120px"}}/>}
        </Container>
    </Box>
  )
}

export default SearchPage;
