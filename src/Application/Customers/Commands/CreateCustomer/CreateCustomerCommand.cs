using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Edunary.Application.Customers.Validation;

namespace Edunary.Application.Customers.Commands.CreateCustomer;
public class CreateCustomerCommand : IRequest<Result>
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(200, ErrorMessage = "Maximum length is 200 characters.")]
    public string UserName { get; set; } 

    [Required(ErrorMessage = "Phone Number is required.")]
    [MaxLength(15, ErrorMessage = "Maximum length is 15 characters.")]
    [RegularExpression("([0-9]+)", ErrorMessage = "Phone Number must contain only numbers.")]
    public string PhoneNumber { get; set; }

    [Required(ErrorMessage = "Email is required.")]
    [CheckEmailExists(ErrorMessage = "Email already exists.")]
    [RegularExpression(@"^[a-zA-Z0-9]+(?:[-._]?[a-zA-Z0-9]+)+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Email is invalid.")]
    public string Email { get; set; } 

    public string Password { get; set; } 

    [Required(ErrorMessage = "Customer Name is required.")]
    [MaxLength(200, ErrorMessage = "Maximum length is 200 characters.")]
    public string FullName { get; set; }
}
public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public CreateCustomerCommandHandler(
        IApplicationDbContext context, 
        IIdentityService identityService)
    {
        this._context = context;
        this._identityService = identityService;
    }
    public async Task<Result> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
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
