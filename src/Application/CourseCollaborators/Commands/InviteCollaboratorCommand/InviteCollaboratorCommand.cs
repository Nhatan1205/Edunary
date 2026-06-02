using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Edunary.Domain.Common;
using Microsoft.Extensions.Options;

namespace Edunary.Application.CourseCollaborators.Commands.InviteCollaboratorCommand;

public record InviteCollaboratorCommand : IRequest<Result>
{
    public int CourseId { get; init; }
    public string Email { get; init; } = string.Empty;
    public CoursePermission Permissions { get; init; }
    public bool IsVisible { get; init; }
    public decimal RevenueSharePercent { get; init; }
}

public class InviteCollaboratorCommandHandler : IRequestHandler<InviteCollaboratorCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICourseAuthorizationService _courseAuth;
    private readonly IIdentityService _identityService;
    private readonly IEmailService _emailService;
    private readonly INotifyService _notifyService;
    private readonly AppSettings _appSettings;

    public InviteCollaboratorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ICourseAuthorizationService courseAuth,
        IIdentityService identityService,
        IEmailService emailService,
        INotifyService notifyService,
        IOptions<AppSettings> appSettings)
    {
        _context = context;
        _currentUserService = currentUserService;
        _courseAuth = courseAuth;
        _identityService = identityService;
        _emailService = emailService;
        _notifyService = notifyService;
        _appSettings = appSettings.Value;
    }

    public async Task<Result> Handle(InviteCollaboratorCommand request, CancellationToken cancellationToken)
    {
        var ownerId = _currentUserService.UserId;

        if (!await _courseAuth.IsOwnerAsync(request.CourseId, ownerId, cancellationToken))
        {
            return Result.Failure("Only the course owner can invite collaborators.");
        }

        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);
        Guard.Against.NotFound(request.CourseId, course);

        // Find invitee by email
        var userIds = await _identityService.SearchUserIdsByNameOrEmailAsync(
            string.Empty, request.Email, cancellationToken);
        var inviteeId = userIds.FirstOrDefault();

        if (inviteeId is null)
            return Result.Failure("No user found with that email address.");

        if (inviteeId == ownerId)
            return Result.Failure("You cannot invite yourself as a collaborator.");

        await using (var transaction = await _context.Database.BeginTransactionAsync(cancellationToken))
        {
            var lockedRows = await LockCourseShareCapacityAsync(request.CourseId, cancellationToken);
            if (lockedRows == 0)
                return Result.Failure("Course not found.");

            var existing = await _context.CourseCollaborators
                .FirstOrDefaultAsync(c => c.CourseId == request.CourseId && c.UserId == inviteeId, cancellationToken);

            if (existing is not null)
                return Result.Failure("This user already has a pending or active collaboration on this course.");

            // Pending and accepted collaborators reserve revenue share capacity; declined rows do not.
            var existingTotal = await _context.CourseCollaborators
                .Where(c => c.CourseId == request.CourseId
                         && c.InviteStatus != CollaboratorInviteStatus.Declined)
                .SumAsync(c => c.RevenueSharePercent, cancellationToken);

            if (existingTotal + request.RevenueSharePercent > 100)
                return Result.Failure("Total revenue share for collaborators cannot exceed 100%.");

            var collaborator = new CourseCollaborator
            {
                CourseId = request.CourseId,
                UserId = inviteeId,
                Permissions = request.Permissions,
                IsVisible = request.IsVisible,
                RevenueSharePercent = request.RevenueSharePercent,
                InviteStatus = CollaboratorInviteStatus.Pending,
            };

            _context.CourseCollaborators.Add(collaborator);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }

        // Send email via background job
        var ownerName = _currentUserService.FullName;
        var subject = $"You've been invited to collaborate on \"{course.Title}\"";
        var actionUrl = $"{_appSettings.ClientUrl}/instructor/invitations";
        var html = EmailTemplates.BuildCollaboratorInvitationTemplate(ownerName, course.Title, actionUrl);
        await _emailService.SendBulkEmailsAsync([request.Email], subject, html);

        // In-app notification
        await _notifyService.NotifyUserAsync(
            inviteeId,
            $"You've been invited to collaborate on \"{course.Title}\"",
            $"{ownerName} invited you to collaborate. Check your invitations.",
            "collaborator_invitation",
            new { courseId = course.Id },
            cancellationToken,
            courseId: course.Id,
            url: "/instructor/invitations",
            imageUrl: course.ImageUrl ?? string.Empty);

        return Result.Success("Invitation sent successfully.");
    }

    // No-op UPDATE to lock the Course row, serializing concurrent share-capacity checks so totals can't exceed 100%.
    private Task<int> LockCourseShareCapacityAsync(int courseId, CancellationToken cancellationToken)
    {
        return _context.Courses
            .Where(c => c.Id == courseId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(c => c.LastModified, c => c.LastModified), cancellationToken);
    }
}
