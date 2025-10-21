namespace Edunary.Application.Common.Models;
public class FileUploadDto
{
    public string FileName { get; set; }
    public long Length { get; set; }
    public Stream Stream { get; set; }
}
