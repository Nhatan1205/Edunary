using Edunary.Application.Common.Interfaces;
using Edunary.Infrastructure.Data;
using Edunary.Infrastructure.Hubs;
using Edunary.Infrastructure.Identity;
using Edunary.Web.Infrastructure;
using NSwag;
using NSwag.Generation.Processors.Security;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddKeyVaultIfConfigured(builder.Configuration);

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddWebServices();
builder.Services.AddSignalR(); //add websocket services

//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(
//        builder =>
//        {
//            builder.WithOrigins("https://localhost:44447")
//                .AllowAnyHeader()
//                .WithMethods("GET", "POST")
//                .AllowCredentials();
//        });
//});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseExceptionHandler(options => { });

app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});
//app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

//app.MapRazorPages(); // turn off Identity UI default

app.MapFallbackToFile("index.html");


app.MapEndpoints();
app.Run();

public partial class Program { }
