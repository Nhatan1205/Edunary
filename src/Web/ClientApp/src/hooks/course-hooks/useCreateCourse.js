import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CoursesClient, CreateCourseCommand } from "../../web-api-client.ts";
import { useNavigate } from "react-router";
import queryClient from "../../configs/reactQuery.js";

const useCreateCourse = () => {
  const coursesClient = new CoursesClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (courseData) => {
      const command = new CreateCourseCommand({
        ...courseData,
      });

      return await coursesClient.createCourse(command);
    },
    onSuccess: (response) => {
      const courseId = response?.result?.id;
      if (courseId) {
        toast.success("Course created successfully!");
        queryClient.invalidateQueries(["courses"]);
        navigate(`/instructor/course/${courseId}/manage/basics`, { replace: true });
      }
      else {
        navigate(`/instructor/courses`, { replace: true });
      }

    },
    onError: (error) => {
      const msg =
        error?.response ||
        error?.message ||
        "Failed to create course. Please try again.";
      toast.error(msg);
    },
  });
};

export default useCreateCourse;
