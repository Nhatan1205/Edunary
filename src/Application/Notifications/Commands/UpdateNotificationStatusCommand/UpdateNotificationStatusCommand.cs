using Edunary.Application.Common.Models;
using Edunary.Application.Common.Interfaces;
namespace Edunary.Application.Notifications.Commands.UpdateNotificationIsReadCommand;
public class UpdateNotificationStatusCommand : IRequest<Result>
{
    public int Id { get; init; }
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
        var entity = await _context.NotificationUsers
            .Where(n => n.Id == request.Id && n.StudentId == userId)
            .FirstOrDefaultAsync(cancellationToken);
        if (entity == null)
        {
            return Result.Failure("Notification not found");
        }
        entity.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success("Notification marked as read successfully");
    }
}
