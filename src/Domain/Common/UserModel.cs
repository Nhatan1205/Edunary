using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunary.Domain.Common;
public class UserModel
{
    public string Id { get; set; } 
    public string UserName { get; set; }
    public string PhoneNumber { get; set; } 
    public string Email { get; set; } 
    public string FullName { get; set; } 
    public string Avatar { get; set; }
    public string Password { get; set; }
    public List<string> Roles { get; set; }
    public bool Disable { get; set; }
}
