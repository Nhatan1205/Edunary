// import { Typography } from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";

function CourseCaptions() {
  return (
    <Container className="py-2">
      <AlertBox severity="info" sx={{ mb: 4 }}>Learners of all levels of language proficiency highly value subtitles as it helps follow, understand and memorize the content. Also having subtitles to ensure the content is accessible for those that are deaf or hard of hearing is crucial</AlertBox>
    </Container>
  );
}

export default CourseCaptions;
