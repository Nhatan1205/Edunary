using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Enrollments.Queries.GetCourseIdsByStudentIdQuery;
using Edunary.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Hubs;
public class NotificationHub : Hub
{
    private readonly ApplicationDbContext _context;
    private readonly ISender _sender;

    public NotificationHub(ApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            var enrolledCourseIds = await _sender.Send(new GetCourseIdsByStudentIdQuery { StudentId = userId });

            foreach (var courseId in enrolledCourseIds)
            {
                await AddToGroup(courseId.Id.ToString());
            }
        }
        await base.OnConnectedAsync();
    }
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
    public async Task AddToGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}
