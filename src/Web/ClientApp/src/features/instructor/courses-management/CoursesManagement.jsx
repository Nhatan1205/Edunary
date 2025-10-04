import { useState, useMemo } from "react";
import { Container } from "reactstrap";
import ToolbarCourse from "./ToolbarCourse";
import CourseList from "./CourseList";
import { coursesData } from "./CourseMockData";
import PageTitle from "../../../components/share/PageTitle";

function CoursesManagement() {
  const [searchInput, setSearchInput] = useState(""); // nhập trong ô
  const [searchTerm, setSearchTerm] = useState(""); // term để filter
  const [filter, setFilter] = useState("newest");

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClick = () => {
    setSearchTerm(searchInput); // chỉ cập nhật khi bấm nút
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleNewCourse = () => {
    console.log("Create new course");
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = coursesData.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Sort based on filter
    switch (filter) {
      case "oldest":
        filtered = [...filtered].reverse();
        break;
      case "title":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        filtered = [...filtered].sort((a, b) =>
          a.status.localeCompare(b.status),
        );
        break;
      case "newest":
      default:
        // Keep original order (newest first)
        break;
    }

    return filtered;
  }, [searchTerm, filter]);

  return (
    <Container fluid className="py-4">
      <PageTitle title="Courses Management" />
      <ToolbarCourse
        searchInput={searchInput}
        filter={filter}
        onSearchInputChange={handleSearchInputChange}
        onSearchClick={handleSearchClick}
        onFilterChange={handleFilterChange}
        onNewCourse={handleNewCourse}
      />
      <CourseList courses={filteredCourses} />
    </Container>
  );
}

export default CoursesManagement;
