import { Typography } from "@mui/material";
import { Container } from "reactstrap";

function CourseCaptions() {
  return <Container className="py-4">
    <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
    Learners of all levels of language proficiency highly value subtitles as it helps follow, understand and memorize the content. Also having subtitles to ensure the content is accessible for those that are deaf or hard of hearing is crucial
    </Typography>
  </Container>
}

export default CourseCaptions;
