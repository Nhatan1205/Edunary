using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;

namespace Edunary.Application.NotificationUsers.Commands.CreateNotificationUserCommand;
public class CreateNotificationUserCommand : IRequest<Result>
{
    public int NotificationId { get; init; }
    public string StudentId { get; init; }
    public bool IsRead { get; init; }
}

public class CreateNotificationUserCommandHandler : IRequestHandler<CreateNotificationUserCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public CreateNotificationUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<Result> Handle(CreateNotificationUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var entity = new NotificationUser
            {
                NotificationId = request.NotificationId,
                StudentId = request.StudentId,
                IsRead = request.IsRead,
            };
            _context.NotificationUsers.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success("NotificationUser created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while creating notification user: {ex.Message}");
        }
    }
}

