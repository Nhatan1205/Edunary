import { useState } from "react";
import { Col, Row } from "reactstrap";
import ToolbarCourse from "./ToolbarCourse";
import PageTitle from "../../../../components/PageTitle";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CourseCard from "./CourseCard";
import { useSearchParams } from "react-router";
import { getCourseManagementSortBy } from "../../../../utils/helpers";
import CustomPagination from "../../../../components/pagination/CustomPagination";
import MainCard from "../../../../components/instructor-layout/MainCard";
import NoData from "../../../../components/NoData";
import emptyCoursesImg from "../../../../assets/images/empty-courses.png";

function CoursesListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const sortParam = searchParams.get("ordering") || "";
  const sortBy = getCourseManagementSortBy(sortParam);

  const { data: coursesData, isLoading: isCourseDataLoading } =
    useGetCoursesAuthor(decodeURIComponent(query), sortBy, pageNumber, 5);

  function handlePageChange(event, value) {
    setPageNumber(value);
  }

  return (
    <MainCard>
      <PageTitle title="Courses Management" />
      <ToolbarCourse />
      {isCourseDataLoading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <LoadingSpinner />
        </div>
      ) : coursesData?.items?.length > 0 ? (
        <Row className="g-3">
          {coursesData?.items?.map((course) => (
            <Col key={course.id} xs={12}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      ) : (
        <NoData
          image={emptyCoursesImg}
          title={query ? `No results found for "${decodeURIComponent(query)}"` : "You don't have any courses yet"}
          description={query
            ? "Try a different keyword or clear your search to see all your courses."
            : "Start creating your first course and share your knowledge with students around the world."}
        />
      )}

      {coursesData && coursesData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <CustomPagination count={coursesData.totalPages} page={pageNumber} onChange={handlePageChange} />
        </div>
      )}
    </MainCard>
  );
}

export default CoursesListPage;
