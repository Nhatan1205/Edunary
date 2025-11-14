using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Edunary.Application.Common.Models;

public class ReturnResult<T>
{
    public T Result { get; set; }
    public string Message { get; set; }
}