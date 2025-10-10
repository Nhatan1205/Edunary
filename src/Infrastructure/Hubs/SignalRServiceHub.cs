using System.Threading;
using Edunary.Application.Common.Interfaces;
using Edunary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Hubs;

public class SignalRServiceHub : Hub
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public SignalRServiceHub(ICurrentUserService currentUserService, IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;

    }

    public async Task SendMessage(string user, string message,string method)
        => await Clients.All.SendAsync(method, user, message);

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if(!string.IsNullOrEmpty(userId))
        {
            var enrolledCourseIds = await _context.Enrollments
            .Where(e => e.StudentId == userId)
            .Select(e => e.CourseId)
            .ToListAsync();

            foreach (var courseId in enrolledCourseIds)
            {
                await AddToGroup(Context.ConnectionId, courseId.ToString());
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    public async Task AddToGroup(string connectionId, string groupName)
    {
        await Groups.AddToGroupAsync(connectionId, groupName);
        var payload = new
        {
            message = $"{Context.ConnectionId} has joined the group {groupName}.",

        };
        //await Clients.Group(groupName).SendAsync("ReceiveMessage", payload);
    }

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        var payload = new
        {
            message = $"{Context.ConnectionId} has left the group {groupName}.",

        };
        //await Clients.Group(groupName).SendAsync("ReceiveMessage", payload);
    }
}
