import { useState } from "react";
import { Box, Typography } from "@mui/material";

import PageTitle from "../../../components/PageTitle";
import CustomBreadcrumbs from "../../../components/breadcrumb/CustomBreadcrumbs";
import CollectionsTable from "./components/CollectionsTable";
import CollectionDetail from "./components/CollectionDetail";



// ─── Main Page ────────────────────────────────────────────────────────────────

function QdrantDashboardPage() {
  // Hold the full CollectionSummary object so CollectionDetail can use it
  // immediately without a redundant re-fetch of basic stats.
  const [selectedCollection, setSelectedCollection] = useState(null);

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: "40px", lg: "120px", xl: "240px" } }}>
      <PageTitle title="Qdrant Dashboard" />
      <CustomBreadcrumbs />

      <Box sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700}>
          {selectedCollection ? selectedCollection.name : "Collections"}
        </Typography>
      </Box>

      {selectedCollection ? (
        <CollectionDetail summary={selectedCollection} onBack={() => setSelectedCollection(null)} />
      ) : (
        <CollectionsTable onSelect={setSelectedCollection} />
      )}

      <Box sx={{ height: 80 }} />
    </Box>
  );
}

export default QdrantDashboardPage;
