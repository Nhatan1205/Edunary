import { useMutation } from "@tanstack/react-query";
import { CourseAssistantsClient, SendCourseAssistantMessageCommand } from "../../web-api-client.ts";

const useSendCourseAssistantMessage = () => {
  return useMutation({
    mutationFn: async ({ courseId, contentId, contentType, mediaType, contentTitle, message }) => {
      const client = new CourseAssistantsClient();
      const command = new SendCourseAssistantMessageCommand({
        courseId,
        contentId,
        contentType,
        mediaType,
        contentTitle,
        message,
      });
      return await client.sendCourseAssistantMessage(command);
    },
  });
};

export default useSendCourseAssistantMessage;
