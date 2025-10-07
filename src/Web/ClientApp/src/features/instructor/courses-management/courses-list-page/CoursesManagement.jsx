import { useState, useMemo } from "react";
import { Container } from "reactstrap";
import ToolbarCourse from "./ToolbarCourse";
import CourseList from "./CourseList";
import PageTitle from "../../../../components/PageTitle";
import useGetCoursesAuthor from "../../../../hooks/useGetCoursesAuthor";
import { Pagination } from "@mui/material";
import LoadingSpinner from "../../../../components/LoadingSpinner";

function CoursesManagement() {
  const [pageNumber, setPageNumber] = useState(1);
  const { data: coursesData, isLoading: isCourseDataLoading } =
    useGetCoursesAuthor(pageNumber, 5);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("newest");

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchTerm(searchInput);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    const items = coursesData?.items || [];
    let filtered = items.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Sort based on filter
    switch (filter) {
      case "oldest":
        filtered = [...filtered].sort((a, b) => a.id - b.id);
        break;
      case "title":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        filtered = [...filtered].sort((a, b) => a.status - b.status);
        break;
      case "newest":
      default:
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
    }

    return filtered;
  }, [searchTerm, filter, coursesData]);

  if (isCourseDataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Container fluid>
      <PageTitle title="Courses Management" />
      <ToolbarCourse
        searchInput={searchInput}
        filter={filter}
        onSearchInputChange={handleSearchInputChange}
        onSearchClick={handleSearchClick}
        onFilterChange={handleFilterChange}
      />
      <CourseList courses={filteredCourses} />

      {coursesData && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            count={coursesData.totalPages}
            page={pageNumber}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </div>
      )}
    </Container>
  );
}

export default CoursesManagement;
