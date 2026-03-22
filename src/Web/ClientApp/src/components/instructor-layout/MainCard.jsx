import { Card, CardContent, Divider } from '@mui/material';
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
            <CustomBreadcrumbs />
            <Divider />
            <CardContent sx={{ px: 3 }}>
                {children}
            </CardContent>
        </Card>
    );
}