import { Typography } from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";

function CourseAccessiblity() {
  return (
  <Container className="py-4">
      <AlertBox severity="info" title="Create accessible learning content" sx={{borderRadius: 6,borderColor: "divider",py: 3}}>
        <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
          Accessibility provides a person with a disability access to — and benefits of — the same information, interactions, and services as a person without a disability in a way that’s sensible, meaningful, and usable. In short, it’s the inclusive practice of ensuring there are no barriers to learning for as many people as possible.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
          Some may think that accessibility is primarily aimed at helping people with physical disabilities, such as those with hearing or vision loss. However, making content accessible to everyone isn’t just the equitable thing to do, it also helps to broaden your reach so that more learners can benefit from your courses.
        </Typography>
      </AlertBox>

      <Typography variant="subtitle1" sx={{mt: 3, mb: 1, fontWeight: 700 }}>
          Accessibility checklists
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
          To help you create accessible course content, we’ve provided Instructors with recommendations and best practices to consider while creating new courses or updating existing content. Please review these accessibility recommendations and checklists to indicate whether your course meets the guidelines.
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
          Note: while these accessibility guidelines are strongly recommended, they are not a requirement prior to publishing your course. Though content that does meet these accessibility guidelines may benefit from a greater number of learners who could take your course.
        </Typography>
  </Container>
  );
}

export default CourseAccessiblity;
