using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;
namespace Edunary.Application.Notifications.Commands.UpdateNotificationIsReadCommand;
public class UpdateNotificationStatusCommand : IRequest<Result>
{
    public List<int> Ids { get; init; } = new();
}

public class UpdateNotificationStatusCommandHandler : IRequestHandler<UpdateNotificationStatusCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    public UpdateNotificationStatusCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
    public async Task<Result> Handle(UpdateNotificationStatusCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService?.UserId;

        var entities = await _context.NotificationUsers
            .Where(n => request.Ids.Contains(n.Id) && n.StudentId == userId)
            .ToListAsync(cancellationToken);

        if (!entities.Any())
        {
            return Result.Failure("Notifications not found");
        }

        foreach (var entity in entities)
        {
            entity.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Notifications marked as read successfully");

    }
}
