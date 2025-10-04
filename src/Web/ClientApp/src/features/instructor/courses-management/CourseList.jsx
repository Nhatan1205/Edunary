import { Row, Col } from "reactstrap";
import CourseCard from "./CourseCard";

const CourseList = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No courses found</p>
      </div>
    );
  }

  return (
    <Row className="g-3">
      {courses.map((course) => (
        <Col key={course.id} xs={12}>
          <CourseCard course={course} />
        </Col>
      ))}
    </Row>
  );
};

export default CourseList;
