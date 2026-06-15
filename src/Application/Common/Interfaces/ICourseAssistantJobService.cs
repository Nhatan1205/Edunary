namespace Edunary.Application.Common.Interfaces;

public interface ICourseAssistantJobService
{
    void EnqueueCourseAssistantMessage(
        string userId,
        int courseId,
        string contentId,
        string contentType,
        string mediaType,
        string contentTitle,
        string message);

    Task ProcessCourseAssistantMessageAsync(
        string userId,
        int courseId,
        string contentId,
        string contentType,
        string mediaType,
        string contentTitle,
        string message);
}
