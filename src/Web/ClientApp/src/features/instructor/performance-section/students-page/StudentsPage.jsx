import { useState } from "react";
import { Box, Typography } from "@mui/material";
import PageTitle from "../../../../components/PageTitle";
import MainCard from "../../../../components/instructor-layout/MainCard";
import StudentDataGrid from "./components/StudentDataGrid";
import StudentDetailDrawer from "./components/StudentDetailDrawer";
import useGetInstructorRecentStudents from "../../../../hooks/enrollment-hooks/useGetInstructorRecentStudents";
import useGetInstructorStudents from "../../../../hooks/enrollment-hooks/useGetInstructorStudents";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import RecentStudentsSlider from "./components/RecentStudentsSlider";
import NoData from "../../../../components/NoData";
import emptyStudentsImg from "../../../../assets/images/empty-students.png";

function StudentsPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState([]);
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const courseId = selectedCourse[0]?.value ?? undefined;
    const { data: recentData, isLoading: recentLoading } = useGetInstructorRecentStudents();

    const { data: studentsData, isLoading: studentsLoading } =
        useGetInstructorStudents({
            courseId,
            sortBy,
            pageNumber: page + 1,
            pageSize: rowsPerPage,
        });

    const { data: coursesData } = useGetCoursesAuthor("", 0, 1, 100, 4);

    const courseOptions = (coursesData?.items ?? []).map((c) => ({
        label: c.title,
        value: c.id,
    }));

    const handleViewDetail = (student) => {
        setSelectedStudentId(student.studentId);
        setDrawerOpen(true);
    };

    const totalStudents = recentData?.totalStudents ?? 0;
    const topStudents = recentData?.students ?? [];
    const items = studentsData?.items ?? [];
    const totalCount = studentsData?.totalCount ?? 0;

    const showEmptyState = !recentLoading && !studentsLoading && totalStudents === 0;

    return (
        <MainCard>
            {/* ── Header ── */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 1 }}>
                <PageTitle title="Students" subtitle="" />
            </Box>

            {showEmptyState ? (
                <NoData
                    image={emptyStudentsImg}
                    title="No Students Enrolled Yet"
                    description="Once students enroll in your courses, their profiles, enrollment dates, and learning progress will appear here."
                />
            ) : (
                <>
                    {/* ── Total count ── */}
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "text.primary", mb: 0.25 }}>
                        {totalStudents.toLocaleString()} students
                    </Typography>

                    {/* ── Recent Students Slider ── */}
                    <RecentStudentsSlider
                        students={topStudents}
                        isLoading={recentLoading}
                        onStudentClick={handleViewDetail}
                    />

                    {/* ── Student DataGrid ── */}
                    <Box sx={{ mt: 4 }}>
                        <StudentDataGrid
                            items={items}
                            totalCount={totalCount}
                            isLoading={studentsLoading}
                            selectedCourse={selectedCourse}
                            onCourseChange={setSelectedCourse}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            courses={courseOptions}
                            onViewDetail={handleViewDetail}
                        />
                    </Box>
                </>
            )}

            {/* ── Student Detail Drawer ── */}
            <StudentDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                studentId={selectedStudentId}
            />
        </MainCard>
    );
}

export default StudentsPage;
