import { Container, Row, Col } from 'reactstrap';
import { Button, Typography, Box, Tabs, Tab } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageTitle from '../../../../components/PageTitle';
import NoData from '../../../../components/NoData';
import emptyMailboxImg from "../../../../assets/images/empty-mailbox.png";
import { Link as RouterLink, useNavigate } from "react-router";
import { useState } from 'react';
import useGetAnnouncements from '../../../../hooks/announcement-hooks/useGetAnnouncements';
import CustomPagination from '../../../../components/pagination/CustomPagination';
import CustomDataGrid from '../../../../components/datagrid/CustomDataGrid';
import MainCard from '../../../../components/instructor-layout/MainCard';


const columnsSetting = [
    {
        field: 'subject',
        headerName: 'Subject',
        flex: 2,
        minWidth: 200,
        renderCell: (params) => (
            <div style={{
                whiteSpace: 'normal',
                lineHeight: '1.4',
                paddingTop: '8px',
                paddingBottom: '8px'
            }}>
                {params.value}
            </div>
        )
    },
    {
        field: 'content',
        headerName: 'Content',
        flex: 3,
        minWidth: 300,
        renderCell: (params) => {
            const textContent = params.value.replace(/<[^>]*>/g, '');
            return (
                <div
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                    }}
                    title={textContent}
                >
                    {textContent}
                </div>
            );
        }
    },
    {
        field: 'sentAt',
        headerName: 'Sent At',
        width: 180,
        renderCell: (params) => {
            if (!params.value) return '-';
            const date = new Date(params.value);
            return (
                <div>
                    {date.toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            );
        }
    },
    {
        field: 'created',
        headerName: 'Created',
        width: 180,
        renderCell: (params) => {
            const date = new Date(params.value);
            return (
                <div>
                    {date.toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            );
        }
    }
];

export default function AnnouncementsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    function handleTabChange(event, newValue) {
        setActiveTab(newValue)
        setPageNumber(1);
    }

    function handlePageChange(event, value) {
        setPageNumber(value);
    }

    const { data: announcementsData, isLoading: isAnnouncementsLoading } = useGetAnnouncements(activeTab, pageNumber, 8);

    function handleRowClick(params) {
        navigate(`/instructor/communication/announcements/${params.id}/edit`);
    }

    // Kiểm tra xem có data hay không
    const hasData = announcementsData?.items && announcementsData.items.length > 0;

    return (
        <MainCard>
            <Row className="mb-4">
                <Col xs="12" className="mb-3 d-flex justify-content-between align-items-center">
                    <PageTitle title="Announcements" />
                    <Button
                        component={RouterLink}
                        to="/instructor/communication/announcements/new"
                        variant="contained"
                        sx={{
                            bgcolor: 'brand.main',
                            '&:hover': { bgcolor: 'brand.dark' },
                            textTransform: 'none',
                            px: 3,
                            py: 1
                        }}
                    >
                        Compose
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col xs="12">
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            lineHeight: 1.6,
                            mb: 2
                        }}
                    >
                        Share updates and important information about your course. These will be sent via email and appear in the course dashboard. Only external links are allowed. Edunary links are not permitted.
                    </Typography>
                    <Box sx={{ pt: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    color: 'text.tertiary',
                                    px: 3,
                                    py: 2,
                                    '&.Mui-selected': {
                                        color: 'brand.main',
                                        fontWeight: 600,
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'brand.main',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                },
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Tab label="Your Draft" />
                            <Tab label="History" />
                        </Tabs>
                    </Box>

                    {!isAnnouncementsLoading && !hasData ? (
                        <NoData
                            image={emptyMailboxImg}
                            title="No announcements yet"
                            description="Here's where you can send your students email announcements. Use educational emails to support your students' learning. Use promotional emails to market your courses."
                        />
                    ) : (
                        /* Hiển thị DataGrid khi có data */
                        hasData && (
                            <Box sx={{ bgcolor: 'white', borderRadius: 2, py: 3, mt: 2 }}>
                                <CustomDataGrid
                                    rows={announcementsData.items}
                                    columns={columnsSetting}
                                    loading={isAnnouncementsLoading}
                                    checkboxSelection={false}
                                    onRowClick={handleRowClick}
                                    height={468}
                                />
                                {announcementsData.totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <CustomPagination
                                            count={announcementsData.totalPages}
                                            page={pageNumber}
                                            onChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </Box>
                        )
                    )}
                </Col>
            </Row>
        </MainCard>
    );
}