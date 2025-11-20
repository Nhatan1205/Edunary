import { useState} from "react";
import { Col, Container, Row } from "reactstrap";
import ToolbarCourse from "./ToolbarCourse";
import PageTitle from "../../../../components/PageTitle";
import useGetCoursesAuthor from "../../../../hooks/useGetCoursesAuthor";
import { Typography } from "@mui/material";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import CourseCard from "./CourseCard";
import { useSearchParams } from "react-router";
import { getCourseManagementSortBy } from "../../../../utils/helpers";
import CustomPagination from "../../../../components/pagination/CustomPagination";

function CoursesListPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const sortParam = searchParams.get("ordering") || "";
  const sortBy = getCourseManagementSortBy(sortParam);

  const { data: coursesData, isLoading: isCourseDataLoading } =
    useGetCoursesAuthor(decodeURIComponent(query),sortBy,pageNumber, 5);


  function handlePageChange(event,value){
    setPageNumber(value);
  };

  return (
    <Container fluid>
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
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mt: 4 }}
        >
          {query
            ? `No results found for "${decodeURIComponent(query)}"`
            : "You don’t have any courses"}
        </Typography>
      )}

      {coursesData && coursesData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <CustomPagination count={coursesData.totalPages} page={pageNumber} onChange={handlePageChange}/>
        </div>
      )}
    </Container>
  );
}

export default CoursesListPage;
