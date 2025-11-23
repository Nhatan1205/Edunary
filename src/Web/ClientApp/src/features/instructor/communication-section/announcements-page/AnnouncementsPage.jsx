import { Container, Row, Col } from 'reactstrap';
import { Button, Typography, Box } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import PageTitle from '../../../../components/PageTitle';
import emptyMailboxImg from "../../../../assets/images/empty-mailbox.png";
import { Link as RouterLink } from "react-router";

export default function AnnouncementsPage() {
  return (
    <Container fluid>
        <Row className="mb-4">
            <Col xs="12" className="d-flex justify-content-between align-items-center">
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
            <Box 
                sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '420px',
                bgcolor: 'white',
                borderRadius: 2,
                p: 4
                }}
            >
                <Box
                component="img"
                src={emptyMailboxImg}
                alt="Example"
                sx={{
                    width: 200,
                    height: "auto",
                    borderRadius: 2,
                }}
                />

                <Typography 
                variant="h5" 
                sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    mb: 2
                }}
                >
                No announcements yet
                </Typography>

                <Typography 
                variant="body1" 
                sx={{ 
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '500px',
                    lineHeight: 1.6
                }}
                >
                    Here's where you can send your students email announcements. Use educational emails to support your students' learning. Use promotional emails to market your courses.
                </Typography>
            </Box>
            </Col>
        </Row>
    </Container>
  );
}