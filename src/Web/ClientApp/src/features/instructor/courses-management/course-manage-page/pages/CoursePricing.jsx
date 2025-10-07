import { useParams } from "react-router";

function CoursePricing() {
  const { courseId } = useParams();
  console.log(courseId);
  return <div>fdsfds</div>;
}

export default CoursePricing;
