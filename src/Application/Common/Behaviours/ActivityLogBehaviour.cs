using System.Reflection;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Domain.Enums;

namespace Edunary.Application.Common.Behaviours;

[AttributeUsage(AttributeTargets.Class)]
public class ActivityLogAttribute : Attribute
{
    public ActivityType ActivityType { get; }
    public string Description { get; }

    public ActivityLogAttribute(ActivityType activityType, string description)
    {
        ActivityType = activityType;
        Description = description;
    }
}


public class ActivityLogBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IActivityLogService _activityLogService;

    public ActivityLogBehaviour(ICurrentUserService currentUserService, IActivityLogService activityLogService)
    {
        _currentUserService = currentUserService;
        _activityLogService = activityLogService;
    }

    public async Task<TResponse> Handle(TRequest request,RequestHandlerDelegate<TResponse> next,CancellationToken cancellationToken)
    {
        var response = await next();

        var attr = typeof(TRequest).GetCustomAttribute<ActivityLogAttribute>();
        if (attr == null)
            return response;

        _activityLogService.EnqueueLog(new ActivityLogEntry
        {
            UserId = _currentUserService.UserId,
            ActivityType = attr.ActivityType,
            Description = attr.Description
        });

        return response;
    }
}
