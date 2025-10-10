using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.Notifications.Commands.CreateNotificationCommand;
public class CreateNotificationCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string Title { get; init; }
    public string Message { get; init; }
    public string Type { get; init; }

    public string Url { get; init; }
}

public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public CreateNotificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = new Notification
            {
                CourseId = request.CourseId,
                Title = request.Title,
                Message = request.Message,
                Type = request.Type,
                Url = request.Url,
            };
            _context.Notifications.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success(entity.Id, "Notification created successfully");

        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while creating notification: {ex.Message}");
        }
    }
}
