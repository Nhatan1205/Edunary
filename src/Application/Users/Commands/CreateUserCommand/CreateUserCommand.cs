using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Users.Validation;

namespace Edunary.Application.Users.Commands.CreateUserCommand;
public class CreateUserCommand : IRequest<Result>
{
    public string UserName { get; init; }
    public string PhoneNumber { get; init; }
    public string Email { get; init; }
    public string Password { get; init; }
    public string FullName { get; init; }
}
public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(
        IApplicationDbContext context,
        IIdentityService identityService)
    {
        this._context = context;
        this._identityService = identityService;
    }
    public async Task<Result> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var rs = await _identityService.Register(request.Email, request.PhoneNumber, request.Email, request.Password, request.FullName);
            return rs;
        }
        catch (Exception ex)
        {
            return Result.Failure($"An unexpected error occurred while creating customer: {ex.Message}");
        }

    }
}
