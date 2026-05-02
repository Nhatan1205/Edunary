using Edunary.Application.Common.Models;
using Edunary.Application.KnowledgeBase;
using Edunary.Application.KnowledgeBase.Commands.DeleteKnowledgeDocument;
using Edunary.Application.KnowledgeBase.Commands.UploadKnowledgeDocument;
using Edunary.Application.KnowledgeBase.Queries.GetKnowledgeDocuments;
using Edunary.Domain.Constants;

namespace Edunary.Web.Endpoints;

public class KnowledgeBase : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization(Policies.SuperAdmin)
            .MapGet(GetDocuments)
            .MapDelete(DeleteDocument, "{id}");

        app.MapGroup(this)
            .DisableAntiforgery()
            .RequireAuthorization(Policies.SuperAdmin)
            .MapPost(UploadDocument);
    }

    public async Task<PaginatedList<KnowledgeDocumentDto>> GetDocuments(
        ISender sender, [AsParameters] GetKnowledgeDocumentsQuery query)
        => await sender.Send(query);

    public async Task<IResult> UploadDocument(ISender sender, IFormFile file)
    {
        await using var stream = file.OpenReadStream();
        var result = await sender.Send(new UploadKnowledgeDocumentCommand
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length,
            FileStream = stream,
        });
        return result.Result != null
            ? Results.Ok(result)
            : Results.BadRequest(result);
    }

    public async Task<IResult> DeleteDocument(ISender sender, int id)
    {
        var result = await sender.Send(new DeleteKnowledgeDocumentCommand(id));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
