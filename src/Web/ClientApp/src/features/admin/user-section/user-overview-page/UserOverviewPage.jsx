import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Row, Col } from "reactstrap";

import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";
import PageTitle from "../../../../components/PageTitle";
import UserStatCards from "./components/UserStatCards";
import RegistrationTrend from "./components/RegistrationTrend";
import StatusDonut from "./components/StatusDonut";
import TopActiveUsers from "./components/TopActiveUsers";
import NewVsReturningChart from "./components/NewVsReturningChart";

import useAdminGetOverviewSummary from "../../../../hooks/user-hooks/useAdminGetOverviewSummary";
import useAdminGetRegistrationTrend from "../../../../hooks/user-hooks/useAdminGetRegistrationTrend";
import useAdminGetNewVsReturning from "../../../../hooks/user-hooks/useAdminGetNewVsReturning";

function UserOverviewPage() {
    const [trendRange, setTrendRange] = useState("30d");
    const [nvYear, setNvYear] = useState(new Date().getFullYear());

    // ── API 1: no params — fetched once ──────────────────────────────────────
    const { data: summary, isLoading: summaryLoading } = useAdminGetOverviewSummary();

    // ── API 2: refetch on range change ────────────────────────────────────────
    const { data: trend, isLoading: trendLoading } = useAdminGetRegistrationTrend(trendRange);

    // ── API 3: refetch on year change ─────────────────────────────────────────
    const { data: nvr, isLoading: nvrLoading } = useAdminGetNewVsReturning(nvYear);

    // ── Stat card data ────────────────────────────────────────────────────────
    const statCards = {
        activeUsers: summary?.activeUsers,
        activeUsersTrend: summary?.activeUsersTrend,
        newUsers30d: summary?.newUsers30d,
        newUsersTrend: summary?.newUsersTrend,
        onlineNow: summary?.onlineNow,
    };

    // ── Status distribution data ──────────────────────────────────────────────
    const statusDist = {
        active: summary?.statusActive,
        inactive: summary?.statusInactive,
        suspended: summary?.statusSuspended,
        banned: summary?.statusBanned,
    };

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px" } }}>
            {/* ── Header ── */}
            <PageTitle title="User Management" />
            <CustomBreadcrumbs />

            <Typography variant="h5" sx={{ fontWeight: 700, mt: 4, mb: 3 }}>
                Overview
            </Typography>

            {/* ── Row 1: Stat Cards ── */}
            <UserStatCards data={statCards} isLoading={summaryLoading} />

            {/* ── Row 2: Area Chart + Donut ── */}
            <Row className="mt-4 g-3">
                <Col xs={12} md={8}>
                    <RegistrationTrend
                        data={trend}
                        range={trendRange}
                        onRangeChange={setTrendRange}
                        isLoading={trendLoading}
                    />
                </Col>
                <Col xs={12} md={4}>
                    <StatusDonut data={statusDist} isLoading={summaryLoading} />
                </Col>
            </Row>

            {/* ── Row 3: Top Users + New vs Returning ── */}
            <Row className="mt-3 g-3">
                <Col xs={12} md={5}>
                    <TopActiveUsers users={summary?.topActiveUsers} isLoading={summaryLoading} />
                </Col>
                <Col xs={12} md={7}>
                    <NewVsReturningChart
                        data={nvr}
                        year={nvYear}
                        onYearChange={setNvYear}
                        isLoading={nvrLoading}
                    />
                </Col>
            </Row>

            <Box sx={{ height: 80 }} />
        </Box>
    );
}

export default UserOverviewPage;
