import { Box, Button, Typography } from "@mui/material";
import { Container } from "reactstrap";
import useGetCourseById from "../../../../../hooks/course-hooks/useGetCourseById";
import { useParams, useNavigate } from "react-router";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import useDeleteCourse from "../../../../../hooks/course-hooks/useDeleteCourse";
import { useState } from "react";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useUpdateCourse from "../../../../../hooks/course-hooks/useUpdateCourse";

function CourseSetting() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: courseData, isLoading: isCourseDataLoading } =
    useGetCourseById(courseId);

  const deleteCourseMutation = useDeleteCourse(() => {
    navigate("/instructor/courses");
  });
  const updatecourseMutation = useUpdateCourse();

  const isDeleting = deleteCourseMutation.isPending || deleteCourseMutation.isLoading;
  const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;
  const canTogglePublish = courseData?.status === 1 || courseData?.status === 2;
  const getButtonText = () => {
    if (courseData?.status === 1) return "Public";
    if (courseData?.status === 2) return "Private";
    return "Unpublished";
  };

  const handleTogglePublish = () => {
    if (!courseData || !canTogglePublish) return;

    const newStatus = courseData.status === 1 ? 2 : 1;

    updatecourseMutation.mutate({
      ...courseData,
      status: newStatus,
    });
  };
  const [openDialog, setOpenDialog] = useState(false);

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    setOpenDialog(false);
    deleteCourseMutation.mutate(courseId);
  };

  if (isCourseDataLoading || !courseData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <ConfirmDialog
        open={openDialog}
        title="Delete Your Course?"
        message="Are you sure you want to delete this course? This is permanent and cannot be undone."
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
      />
      <Container className="py-2">
        <Box>
          <Typography
            variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}
          >
            Course Status
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "text.primary",
            }}
          >
            This course is {courseData?.status === 1 ? "" : "not "}published on the Edunary marketplace.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleTogglePublish}
                disabled={isUpdating || isDeleting || !canTogglePublish}
                sx={{
                  width: "160px",
                  textTransform: "none",
                  borderColor: "brand.main",
                  color: "brand.main",
                  fontWeight: 600,
                  py: 1,
                  "&:hover": {
                    borderColor: "brand.dark",
                    bgcolor: "brand.lighter",
                  },
                }}
              >
                {isUpdating ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LoadingSpinner size={20} />
                  </Box>
                ) : (
                  getButtonText()
                )}
              </Button>
              <Typography
                sx={{
                  color: "#1a1a1a",
                }}
              >
                {courseData?.status === 1
                  ? "New students can find your course via search, enroll, and purchase the course."
                  : "New students cannot find your course via search, but existing students can still access content."}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleDeleteClick}
                disabled={(courseData?.totalStudents ?? 0) > 0 || isDeleting || isUpdating}
                sx={{
                  width: "160px",
                  textTransform: "none",
                  borderColor: "brand.main",
                  color: "brand.main",
                  fontWeight: 600,
                  py: 1,
                  "&:hover": {
                    borderColor: "brand.dark",
                    bgcolor: "brand.lighter",
                  },
                }}
              >
                {isDeleting ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LoadingSpinner size={20} />
                  </Box>
                ) : (
                  "Delete"
                )}
              </Button>
              <Typography
                sx={{
                  color: "#1a1a1a",
                }}
              >
                We promise students lifetime access, so courses cannot be
                deleted after students have enrolled.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default CourseSetting;
