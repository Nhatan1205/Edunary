using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Edunary.Application.Common.Models;

public class Result
{
    internal Result(bool succeeded, object data, string message)
    {
        Succeeded = succeeded;
        Message = message;
        Data = data;
    }

    public bool Succeeded { get; init; }

    public string Message { get; init; }
    public object Data { get; set; }

    public static Result Success(object data = null, string messenge = null)
    {
        return new Result(true, data, messenge);
    }

    public static Result Failure(string error = "Sorry, something went wrong please try again.")
    {
        return new Result(false, null, error);
    }
}
