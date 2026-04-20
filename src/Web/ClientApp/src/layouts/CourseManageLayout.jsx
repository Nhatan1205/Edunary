import { Box, Divider, Paper, Typography } from "@mui/material";
import CourseManageHeader from "../features/instructor/courses-management/course-manage-page/CourseManageHeader";
import CourseManageSidebar from "../features/instructor/courses-management/course-manage-page/CourseManageSidebar";
import { Outlet, useParams, useLocation, useNavigate } from "react-router";
import PageTitle from "../components/PageTitle";
import { useMemo, useState, useEffect } from "react";

const HEADER_HEIGHT = 64;
const SIDEBAR_WIDTH = 272;

function CourseManageLayout() {
  const [activeLabel, setActiveLabel] = useState("Course landing page");
  const { courseId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!/^\d+$/.test(courseId)) {
      navigate("/instructor/courses");
    }
  }, [courseId, navigate]);

  const location = useLocation();

  const sections = useMemo(
    () => [
      {
        title: "Manage your course",
        items: [
          {
            label: "Course landing page",
            path: `/instructor/course/${courseId}/manage/basics`,
          },
          {
            label: "Pricing",
            path: `/instructor/course/${courseId}/manage/pricing`,
          },
          {
            label: "Intended learners",
            path: `/instructor/course/${courseId}/manage/learners`,
          },
          {
            label: "Course messages",
            path: `/instructor/course/${courseId}/manage/messages`,
          },
          {
            label: "Settings",
            path: `/instructor/course/${courseId}/manage/settings`,
          },
        ],
      },
      {
        title: "Create your content",
        items: [
          {
            label: "Curriculum",
            path: `/instructor/course/${courseId}/manage/curriculum`,
          },
          {
            label: "Captions (optional)",
            path: `/instructor/course/${courseId}/manage/captions`,
          },
          {
            label: "Accessibility (optional)",
            path: `/instructor/course/${courseId}/manage/accessibility`,
          },
        ],
      },
    ],
    [courseId],
  );

  useEffect(() => {
    const currentPath = location.pathname;
    for (const section of sections) {
      const foundItem = section.items.find((item) => item.path === currentPath);
      if (foundItem) {
        setActiveLabel(foundItem.label);
        break;
      }
    }
  }, [location.pathname, sections]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CourseManageHeader />

      {/* Main area below header */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          mt: `${HEADER_HEIGHT}px`,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        {/* Sidebar column */}
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.surface",
            pt: 3,
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: `${HEADER_HEIGHT}px`,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowY: "auto",
            /* Tùy chỉnh thanh cuộn cho đẹp hơn */
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {/* Sidebar section label */}
          <CourseManageSidebar
            sections={sections}
            setActiveLabel={setActiveLabel}
          />
        </Box>

        {/* Main content column */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, md: 4, lg: 5 },
            py: 4,
            overflow: "auto",
            bgcolor: "background.default",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              minHeight: `calc(100vh - ${HEADER_HEIGHT + 64}px)`,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              px: { xs: 3, md: 5 },
              py: 4,
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s",
              "&:hover": {
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.07)",
              },
            }}
          >
            {activeLabel !== "Curriculum" && (
              <>
                {/* Page title area */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 22,
                        borderRadius: "4px",
                        background:
                          "linear-gradient(180deg, #3FCCB2 0%, #49BBBD 100%)",
                        flexShrink: 0,
                      }}
                    />
                    <PageTitle title={activeLabel} />
                  </Box>
                </Box>
                <Divider
                  sx={{
                    mb: 3.5,
                    borderColor: "divider",
                    opacity: 0.8,
                  }}
                />
              </>
            )}

            <Outlet />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default CourseManageLayout;
