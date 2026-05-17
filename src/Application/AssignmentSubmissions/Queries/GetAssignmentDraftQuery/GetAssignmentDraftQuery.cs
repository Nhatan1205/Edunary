using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Enums;
using System.Text.Json;

namespace Edunary.Application.AssignmentSubmissions.Queries.GetAssignmentDraftQuery;

public record GetAssignmentDraftQuery : IRequest<AssignmentDraftDto>
{
    public int AssignmentId { get; init; }
}

public class GetAssignmentDraftQueryHandler : IRequestHandler<GetAssignmentDraftQuery, AssignmentDraftDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetAssignmentDraftQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<AssignmentDraftDto> Handle(GetAssignmentDraftQuery request, CancellationToken cancellationToken)
    {
        string userId = _currentUserService.UserId;

        var draft = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(
                s => s.AssignmentId == request.AssignmentId
                    && s.StudentId == userId
                    && s.Status == AssignmentSubmissionStatus.Draft,
                cancellationToken);

        if (draft == null)
        {
            return null;
        }

        List<DraftAnswerItem> answers = new List<DraftAnswerItem>();
        if (!string.IsNullOrEmpty(draft.Answers))
        {
            answers = JsonSerializer.Deserialize<List<DraftAnswerItem>>(
                draft.Answers,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<DraftAnswerItem>();
        }

        return new AssignmentDraftDto
        {
            SubmissionId = draft.Id,
            Answers = answers.ToDictionary(a => a.QuestionId, a => a.AnswerText)
        };
    }
}

internal class DraftAnswerItem
{
    public int QuestionId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
}
