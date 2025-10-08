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
    enabled: !!id, // Chỉ fetch khi id có giá trị hợp lệ
    retry: false, // Không retry khi course không tồn tại
  });
};

export default useGetPublicCourseById;