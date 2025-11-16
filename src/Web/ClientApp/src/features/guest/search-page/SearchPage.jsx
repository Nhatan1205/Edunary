import { Box} from "@mui/material";
import SearchHeader from "./SearchHeader";
import { Container } from "reactstrap";
import SearchSection from "./search-section/SearchSection";
import { useSearchParams } from "react-router";
import NoResult from "../../../components/NoResult";
import FilterToolBar from "./FilterToolBar";
import useGetCourses from "../../../hooks/useGetCourses";
import { getCourseSortBy, getPublishDate } from "../../../utils/helpers";
import useGetCategories from "../../../hooks/useGetCategories";
import { useState } from "react";
import CustomPagination from "../../../components/pagination/CustomPagination";

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

function getHeaderTitle(params,categories= []) {
  const query = params.get("query");
  const categoryIds = params.getAll("category");
  const sort = params.get("sort");

  if (query) {
    return `Result for "${query}"`;
  }
  else if (categoryIds.length === 1) {
    const category = (categories?.items || []).find(c => c.id.toString() === categoryIds[0]);
    return category ? `Featured ${category.title} Courses` : "Category";
  }
  if (categoryIds.length > 1) {
    return "";
  }
  else if (sort && !query) {
    switch (sort) {
      case "newest":
        return "Recent Courses";
      case "num_students":
        return "Popular Courses";
      case "highest_rated":
        return "Top Rated Courses";
      default:
        return "";
    }
  }
  return "";
}


function SearchPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const { data: categoryData } = useGetCategories();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "";
  
  const filters = buildFilterData(searchParams);
  const sortBy = getCourseSortBy(sortParam);
  const headerTitle = getHeaderTitle(searchParams,categoryData);
  const { data: coursesData, isLoading: isCourseDataLoading } = useGetCourses(decodeURIComponent(query),filters,sortBy,pageNumber,24);
  
  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };

  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
        <Container className="my-4">
            <SearchHeader title={headerTitle} resultCount={coursesData?.items?.length || 0} />
            <FilterToolBar categoryData={categoryData} />
            <SearchSection coursesData={coursesData?.items} isLoading={isCourseDataLoading}/>
            {coursesData && coursesData.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <CustomPagination count={100} page={pageNumber} onChange={handlePageChange}/>
              </div>
            )}
            {(coursesData?.items?.length === 0) && <NoResult searchValue={query} sx={{mt: "80px",mb:"120px"}}/>}
        </Container>
    </Box>
  )
}

export default SearchPage;
