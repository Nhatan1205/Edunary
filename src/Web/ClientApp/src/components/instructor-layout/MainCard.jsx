import { Card, CardContent, Divider, Box } from '@mui/material';
import CustomBreadcrumbs from '../breadcrumb/CustomBreadcrumbs';

export default function MainCard({ children }) {
    return (
        <Card sx={{
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            minHeight: "80vh"
        }}>
            <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, py: 1.5 }}>
                <CustomBreadcrumbs />
            </Box>
            <Divider />
            <CardContent sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
                {children}
            </CardContent>
        </Card >
    );
}