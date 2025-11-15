import { Box } from "@mui/material";
import SearchHeader from "./SearchHeader";
import { Container } from "reactstrap";
import SearchSection from "./search-section/SearchSection";
import { useSearchParams } from "react-router";
import NoResult from "../../../components/NoResult";
import FilterToolBar from "./FilterToolBar";
import useGetCourses from "../../../hooks/useGetCourses";
import { getPublishDate } from "../../../utils/helpers";
import { useMemo } from "react";

  function buildFilterData(params){
    const filterData = [];
    //level filter
    const levels = params.getAll("instructional_level");
    if (levels.length > 0) {
      filterData.push({
        Property: "Level",
        Value: levels.join(","),
        Operation: "In",
        Type: "string",
      });
    }
    //rating filter
    const ratings = params.getAll("ratings");
    if (ratings.length > 0) {
      filterData.push({
        Property: "Ratings",
        Value: ratings[0],
        Operation: "GreaterOrEqual",
        Type: "float",
      });
    }
    //price filter
    const prices = params.getAll("price");
    if (prices.includes("free")) {
      filterData.push({
        Property: "Price",
        Value: "0",
        Operation: "Equals",
        Type: "float",
      });
    }

    if (prices.includes("paid")) {
      filterData.push({
        Property: "Price",
        Value: "0",
        Operation: "GreaterThan",
        Type: "float",
      });
    }
    //publish date filter
    const time = params.get("time");
    if (time) {
      const dateValue = getPublishDate(time);
      if (dateValue) {
        filterData.push({
          Property: "Created",
          Value: dateValue,
          Operation: "GreaterOrEqual",
          Type: "datetime",
        });
      }
    }
    //category filter
    const categoryId = params.getAll("category");
    if (categoryId.length > 0) {
      filterData.push({
        Property: "CategoryId",
        Value: categoryId.join(","),
        Operation: "In",
        Type: "int",
      });
    }

    return filterData;
  };

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const filters = useMemo(() => buildFilterData(searchParams), [searchParams]);

  const { data: coursesData, isLoading: isCourseDataLoading } = useGetCourses(decodeURIComponent(query),filters);

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
