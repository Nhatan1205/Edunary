import { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { Row, Col, Container } from "reactstrap";

import WelcomeBanner from "./dashboard/WelcomeBanner";
import TodaySnapshot from "./dashboard/TodaySnapshot";
import DashboardKpiCards from "./dashboard/DashboardKpiCards";
import EnrollmentRevenueTrend from "./dashboard/EnrollmentRevenueTrend";
import PendingActionsWidget from "./dashboard/PendingActionsWidget";
import PlatformHealthGauges from "./dashboard/PlatformHealthGauges";
import EnrollmentDistribution from "./dashboard/EnrollmentDistribution";
import TopCoursesTable from "./dashboard/TopCoursesTable";
import CourseStatusDonut from "./dashboard/CourseStatusDonut";
import PopularInstructors from "./dashboard/PopularInstructors";

import useGetAdminDashboardSummary from "../../hooks/admin-dashboard-hooks/useGetAdminDashboardSummary";
import useGetAdminDashboardTrend from "../../hooks/admin-dashboard-hooks/useGetAdminDashboardTrend";
import useGetAdminDashboardDistributions from "../../hooks/admin-dashboard-hooks/useGetAdminDashboardDistributions";
import useGetBasicUserInfo from "../../hooks/auth-hooks/useGetBasicUserInfor";

export default function Dashboard() {
    const [trendRange, setTrendRange] = useState("30d");
    const handleRangeChange = useCallback((range) => setTrendRange(range), []);

    const { data: summaryData, isLoading: summaryLoading } = useGetAdminDashboardSummary();
    const { data: trendData, isLoading: trendLoading } = useGetAdminDashboardTrend(trendRange);
    const { data: distData, isLoading: distLoading } = useGetAdminDashboardDistributions();
    const { data: userInfo } = useGetBasicUserInfo();

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px" }, mt: "20px" }}>
            <Row className="mb-4 g-3 align-items-stretch">
                <Col xs={12} lg={8}>
                    <WelcomeBanner
                        summaryData={summaryData}
                        isLoading={summaryLoading}
                        userName={userInfo?.fullName}
                    />
                </Col>
                <Col xs={12} lg={4}>
                    <TodaySnapshot
                        summaryData={summaryData}
                        isLoading={summaryLoading}
                    />
                </Col>
            </Row>

            {/* ── ROW 2: KPI Cards ───────────────────────────────────────────── */}
            <Row className="mb-4">
                <Col xs={12}>
                    <DashboardKpiCards data={summaryData} isLoading={summaryLoading} />
                </Col>
            </Row>

            {/* ── ROW 3: Trend Chart + Pending Actions ───────────────────────── */}
            <Row className="mb-4 g-3 align-items-stretch">
                <Col xs={12} lg={8}>
                    <EnrollmentRevenueTrend
                        data={trendData}
                        isLoading={trendLoading}
                        range={trendRange}
                        onRangeChange={handleRangeChange}
                    />
                </Col>
                <Col xs={12} lg={4}>
                    <PendingActionsWidget data={summaryData} isLoading={summaryLoading} />
                </Col>
            </Row>

            {/* ── ROW 4: Platform Health + Enrollment Distribution ───────────── */}
            <Row className="mb-4 g-3 align-items-stretch">
                <Col xs={12} md={5} lg={4}>
                    <PlatformHealthGauges data={summaryData} isLoading={summaryLoading} />
                </Col>
                <Col xs={12} md={7} lg={8}>
                    <EnrollmentDistribution data={distData} isLoading={distLoading} />
                </Col>
            </Row>

            {/* ── ROW 5: Top Courses + Course Status + Popular Instructors ── */}
            <Row className="mb-4 g-3 align-items-stretch">
                <Col xs={12} md={6} lg={4}>
                    <TopCoursesTable data={distData} isLoading={distLoading} />
                </Col>
                <Col xs={12} md={6} lg={4}>
                    <CourseStatusDonut data={summaryData} isLoading={summaryLoading} />
                </Col>
                <Col xs={12} md={12} lg={4}>
                    <PopularInstructors data={distData} isLoading={distLoading} />
                </Col>
            </Row>

        </Box>
    );
}