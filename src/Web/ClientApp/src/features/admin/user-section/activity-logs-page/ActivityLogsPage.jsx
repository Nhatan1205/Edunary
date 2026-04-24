import { Box } from "@mui/material";
import PageTitle from "../../../../components/PageTitle";
import CustomBreadcrumbs from "../../../../components/breadcrumb/CustomBreadcrumbs";

function ActivityLogsPage() {
    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
            <PageTitle title="Activity Logs" />
            <CustomBreadcrumbs />
        </Box>
    );
}

export default ActivityLogsPage;