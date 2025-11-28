import { useParams, Navigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner"; 
import useGetLastAccessedItem from "../../../hooks/useGetLastAccessedItem";
const CourseInitialRedirect = () => {
  const { courseId } = useParams();
  const { data: courseProgressData, isLoading } = useGetLastAccessedItem(courseId);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!courseProgressData) {
    return <Navigate to="lecture/item-1" replace />;
  }

  return <Navigate to={`${courseProgressData.routeType}/${courseProgressData.itemId}`} replace />;
};

export default CourseInitialRedirect;