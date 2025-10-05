import { Row, Col } from "reactstrap";
import CourseCard from "./CourseCard";

const CourseList = ({ courses }) => {
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
