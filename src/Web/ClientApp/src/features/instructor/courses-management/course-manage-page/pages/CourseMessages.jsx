import { Typography } from "@mui/material";
import { Container } from "reactstrap";
import TextEditor from "../../../../../components/TextEditor";
import { useState } from "react";

function CourseMessages() {
  const [content, setContent] = useState("");
  return (
    <Container className="py-4">
      <Typography variant="body2" sx={{ color: "text.primary",textAlign: "justify",mb: 3 }}>
            Write messages to your students (optional) that will be sent automatically when they join or complete your course to encourage students to engage with course content. If you do not wish to send a welcome or congratulations message, leave the text box blank.
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Welcome Message
      </Typography>
       <TextEditor value={content} onChange={setContent} />
    </Container>
  );
}

export default CourseMessages;
