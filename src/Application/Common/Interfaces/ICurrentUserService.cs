using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Interfaces;
public interface ICurrentUserService
{
    string UserId { get; set; }
    string UserName { get; set; }
    string Email { get; set; }
    string FullName { get; set; }
    string Avatar { get; set; }
    string Token { get; }

}
