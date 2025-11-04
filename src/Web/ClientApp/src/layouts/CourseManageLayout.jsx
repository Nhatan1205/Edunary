import { Divider, Paper } from "@mui/material";
import CourseManageHeader from "../features/instructor/courses-management/course-manage-page/CourseManageHeader";
import CourseManageSidebar from "../features/instructor/courses-management/course-manage-page/CourseManageSidebar";
import { Outlet, useParams } from "react-router";
import { Col, Container, Row } from "reactstrap";
import PageTitle from "../components/PageTitle";
import { useMemo, useState } from "react";

function CourseManageLayout() {
  const [activeLabel, setActiveLabel] = useState("Course landing page");
  const { courseId } = useParams();
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

  return (
    <div className="d-flex flex-column vh-100">
      <CourseManageHeader />
      <Container fluid className="flex-grow-1 py-4">
        <Row className="justify-content-center">
          <Col xs="12" md="10" lg="9">
            <div className="d-flex" style={{ marginTop: "70px" }}>
              <CourseManageSidebar
                sections={sections}
                setActiveLabel={setActiveLabel}
              />
              <div className="flex-grow-1 ms-4">
                <Paper
                  elevation={3}
                  sx={{
                    bgcolor: "white",
                    minHeight: "calc(100vh - 128px)",
                    boxShadow:
                      "0 2px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08)",
                    px: 5,
                    py: 4,
                  }}
                >
                  <PageTitle title={activeLabel} />
                  <Divider sx={{ mb: 3 }} />
                  <Outlet />
                </Paper>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CourseManageLayout;
