using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Edunary.Infrastructure.Data;
public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();

        await initialiser.SeedAsync();
        // await Task.CompletedTask;
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger, ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default roles
        var administratorRole = new ApplicationRole(Roles.Administrator);

        if (_roleManager.Roles.All(r => r.Name != administratorRole.Name))
        {
            await _roleManager.CreateAsync(administratorRole);
        }
        var userRole = new ApplicationRole(Roles.User);
        if (_roleManager.Roles.All(r => r.Name != userRole.Name))
        {
            await _roleManager.CreateAsync(userRole);
        }
        // Default users
        var administrator = new ApplicationUser { UserName = "administrator@localhost.com", Email = "administrator@localhost.com" };

        if (_userManager.Users.All(u => u.UserName != administrator.UserName))
        {
            await _userManager.CreateAsync(administrator, "Administrator1!");
            if (!string.IsNullOrWhiteSpace(administratorRole.Name))
            {
                await _userManager.AddToRolesAsync(administrator, new[] { administratorRole.Name });
            }
        }

        // Default data
        // Seed, if necessary
        if (!_context.TodoLists.Any())
        {
            _context.TodoLists.Add(new TodoList
            {
                Title = "Todo List",
                Items =
                {
                    new TodoItem { Title = "Make a todo list 📃" },
                    new TodoItem { Title = "Check off the first item ✅" },
                    new TodoItem { Title = "Realise you've already done two things on the list! 🤯"},
                    new TodoItem { Title = "Reward yourself with a nice, long nap 🏆" },
                }
            });

            await _context.SaveChangesAsync();
        }
        if (!_context.Categories.Any())
        {
            _context.Categories.AddRange(
                new Category { Title = "AI & Innovation" },
                new Category { Title = "Animation & 3D" },
                new Category { Title = "Art & Illustration" },
                new Category { Title = "Crafts & DIY" },
                new Category { Title = "Creative Career" },
                new Category { Title = "Creativity & Inspiration" },
                new Category { Title = "Design" },
                new Category { Title = "Development" },
                new Category { Title = "Film & Video" }
            );

            await _context.SaveChangesAsync();
        }

        if (!_context.RoadmapTopics.Any())
        {
            _context.RoadmapTopics.AddRange(
                new RoadmapTopic { Title = "Frontend" },
                new RoadmapTopic { Title = "Backend" },
                new RoadmapTopic { Title = "Full Stack" },
                new RoadmapTopic { Title = "DevOps" },
                new RoadmapTopic { Title = "Data Analyst" },
                new RoadmapTopic { Title = "AI Engineer" },
                new RoadmapTopic { Title = "Android" },
                new RoadmapTopic { Title = "Machine Learning" },
                new RoadmapTopic { Title = "PostgreSQL" },
                new RoadmapTopic { Title = "iOS" },
                new RoadmapTopic { Title = "Blockchain" },
                new RoadmapTopic { Title = "UX Design" }
            );

            await _context.SaveChangesAsync();
        }

        if (!_context.SystemSettings.Any())
        {
            var allKeys = SettingKey.GetAllKeys();
            foreach (var key in allKeys)
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    Key = key,
                    Value = null
                });
            }
            await _context.SaveChangesAsync();
        }

    }
}
