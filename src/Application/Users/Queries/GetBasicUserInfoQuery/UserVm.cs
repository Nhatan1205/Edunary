using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Models;

namespace Edunary.Application.Users.Queries.GetBasicUserInfoQuery;
public class UserVm
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Avatar { get; set; }
    public string Bank { get; set; }
    public string BankNumber { get; set; }
    public string BankAccountHolder { get; set; }

    public string Headline { get; set; }
    public string Description { get; set; }
    public UserLinksDto Links { get; set; }
}
