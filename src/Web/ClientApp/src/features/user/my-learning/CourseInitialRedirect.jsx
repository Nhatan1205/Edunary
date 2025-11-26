import { useParams, Navigate } from "react-router-dom";
import useGetCourseProgress from "../../../hooks/useGetCourseProgress"; 
import LoadingSpinner from "../../../components/LoadingSpinner"; 

const CourseInitialRedirect = () => {
  const { courseId } = useParams();
  const { data: courseProgressData, isLoading } = useGetCourseProgress(courseId);

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

  try {
    const parsedData = JSON.parse(courseProgressData.progress);
    const contents = parsedData.contents || [];
    
    let targetId = parsedData.lastAccessedItemId;
    let targetType = 'lecture';

    if (!targetId && contents.length > 0 && contents[0].items.length > 0) {
        targetId = contents[0].items[0].itemId;
        targetType = contents[0].items[0].type === 'quiz' ? 'quiz' : 'lecture';
    } else {
        let found = false;
        for (const section of contents) {
            if (section.items && section.items.length > 0) {
                for (const item of section.items) {
                    if (item.itemId === targetId) {
                        targetType = item.type === 'quiz' ? 'quiz' : 'lecture';
                        found = true;
                        break; 
                    }
                }
            }
            if (found) break;
        }
        // ------------------------------------------------------------------------------------
        
        if (!found && contents.length > 0 && contents[0].items.length > 0) {
             targetId = contents[0].items[0].itemId;
             targetType = contents[0].items[0].type === 'quiz' ? 'quiz' : 'lecture';
        }
    }

    return <Navigate to={`${targetType}/${targetId}`} replace />;

  } catch (error) {
    return <Navigate to="lecture/item-1" replace />;
  }
};

export default CourseInitialRedirect;