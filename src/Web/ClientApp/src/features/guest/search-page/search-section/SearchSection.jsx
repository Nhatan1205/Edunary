import { Col, Container, Row } from "reactstrap";
import SearchCourseCard from "./SearchCourseCard";
import { PopoverProvider } from "../../../../context/PopoverContext";
import { Pagination, Skeleton } from "@mui/material";

function SearchSection({ coursesData, isLoading }) {
  return (
    <Container>
      <PopoverProvider>
        <Row>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Col xs={12} md={6} lg={4} className="mb-4" key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={480}
                    sx={{ borderRadius: 2 }}
                  />
                </Col>
              ))
            : coursesData?.map((course) => (
                <Col key={course.id} xs={12} md={6} lg={4} className="mb-4">
                  <SearchCourseCard course={course} />
                </Col>
              ))}
        </Row>
      </PopoverProvider>
    </Container>
  );
}

export default SearchSection;
