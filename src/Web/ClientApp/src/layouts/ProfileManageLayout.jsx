import { Box, Divider } from "@mui/material";
import { Outlet } from "react-router";
import { Container, Row, Col } from "reactstrap";
import ProfileSidebar from "../features/user/profile/ProfileSidebar";

function ProfileManageLayout() {
    return (
        <Box
            sx={{ minHeight: "100vh", py: 5, backgroundColor: "background.default" }}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col xs="12" lg="10" xl="9">
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                backgroundColor: "background.paper",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                overflow: "hidden",
                            }}
                        >
                            {/* Sidebar */}
                            <Box sx={{ py: 3, flexShrink: 0 }}>
                                <ProfileSidebar />
                            </Box>

                            {/* Vertical Divider */}
                            <Divider orientation="vertical" flexItem />

                            {/* Main content */}
                            <Box sx={{ flex: 1, minWidth: 0, py: 1 }}>
                                <Outlet />
                            </Box>
                        </Box>
                    </Col>
                </Row>
            </Container>
        </Box>
    );
}

export default ProfileManageLayout;