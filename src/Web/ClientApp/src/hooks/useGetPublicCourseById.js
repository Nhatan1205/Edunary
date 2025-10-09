import { useQuery } from "@tanstack/react-query";

const useGetPublicCourseById = (id) => {
  return useQuery({
    queryKey: ["publicCourse", id],
    queryFn: async () => {
      const response = await fetch(`/api/Courses/public/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Course not found");
        }
        throw new Error("Failed to fetch course information");
      }

      const result = await response.json();
      return result;
    },
    enabled: !!id, // Only fetch when id has a valid value
    retry: false, // Do not retry when course is not found
  });
};

export default useGetPublicCourseById;