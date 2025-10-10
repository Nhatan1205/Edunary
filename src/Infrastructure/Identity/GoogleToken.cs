using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Infrastructure.Identity;
public class GoogleToken
{
    public string iss { get; set; }
    public string nbf { get; set; }
    public string aud { get; set; }
    public string sub { get; set; }
    public string email { get; set; }
    public bool email_verified { get; set; }
    public string azp { get; set; }
    public string name { get; set; }
    public string picture { get; set; }
    public string given_name { get; set; }
    public string iat { get; set; }
    public string exp { get; set; }
    public string jti { get; set; }
    public string alg { get; set; }
    public string kid { get; set; }
    public string typ { get; set; }
}