using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Edunary.Application.Common.Models;

public class Result
{
    internal Result(bool succeeded, object data, string message, string[] errors = null)
    {
        Succeeded = succeeded;
        Message = message;
        Data = data;
        Errors = errors ?? Array.Empty<string>();
    }

    public bool Succeeded { get; init; }
    public string Message { get; init; }
    public object Data { get; set; }
    public string[] Errors { get; set; }

    public static Result Success(object data = null, string message = null)
    {
        return new Result(true, data, message);
    }

    public static Result Failure(string error = "Sorry, something went wrong please try again.")
    {
        return new Result(false, null, error, new[] { error });
    }

    public static Result Failure(string[] errors)
    {
        var message = errors.Length > 0 ? string.Join("; ", errors) : "Validation failed.";
        return new Result(false, null, message, errors);
    }
}
