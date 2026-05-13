using Edunary.Domain.Constants;
using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
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

        var allKeys = SettingKey.GetAllKeys();
        var existingKeys = _context.SystemSettings.Select(s => s.Key).ToHashSet();
        var missingKeys = allKeys.Where(k => !existingKeys.Contains(k)).ToList();

        if (missingKeys.Count > 0)
        {
            foreach (var key in missingKeys)
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    Key = key,
                    Value = null
                });
            }
            await _context.SaveChangesAsync();
        }

        await SeedFinancialAccountsAsync();
        await SeedTaxRegionsAsync();
        await SeedRevenueSharePlansAsync();
    }

    private async Task SeedTaxRegionsAsync()
    {
        var existing = _context.TaxRegions.Select(r => r.CountryCode).ToHashSet();

        var regions = new[]
        {
            new TaxRegion { CountryCode = "VN", CountryName = "🇻🇳 Vietnam",        VatRate = 0.10m, IsActive = true },
            new TaxRegion { CountryCode = "DE", CountryName = "🇩🇪 Germany",        VatRate = 0.19m, IsActive = true },
            new TaxRegion { CountryCode = "FR", CountryName = "🇫🇷 France",         VatRate = 0.20m, IsActive = true },
            new TaxRegion { CountryCode = "GB", CountryName = "🇬🇧 United Kingdom", VatRate = 0.20m, IsActive = true },
            new TaxRegion { CountryCode = "US", CountryName = "🇺🇸 United States",  VatRate = 0.00m, IsActive = true },
        };

        var toAdd = regions.Where(r => !existing.Contains(r.CountryCode)).ToList();
        if (toAdd.Count > 0)
        {
            _context.TaxRegions.AddRange(toAdd);
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedFinancialAccountsAsync()
    {
        var existingCodes = _context.FinancialAccounts.Select(a => a.AccountCode).ToHashSet();

        var accounts = new[]
        {
            new FinancialAccount { AccountCode = LedgerAccountCode.CashStripe,               AccountName = "Cash – Stripe",                    Kind = AccountKind.Asset,         IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.VatLiability,             AccountName = "VAT Liability",                    Kind = AccountKind.Liability,     IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.IrsWithholdingLiability,  AccountName = "IRS Withholding Liability",         Kind = AccountKind.Liability,     IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.PlatformRevenue,          AccountName = "Platform Revenue",                 Kind = AccountKind.Revenue,       IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.InstructorGrossEarnings,  AccountName = "Instructor Gross Earnings",         Kind = AccountKind.Revenue,       IsPerUser = true  },
            new FinancialAccount { AccountCode = LedgerAccountCode.InstructorNetBalance,     AccountName = "Instructor Net Balance",            Kind = AccountKind.Liability,     IsPerUser = true  },
            new FinancialAccount { AccountCode = LedgerAccountCode.RefundHoldback,           AccountName = "Refund Holdback Reserve",          Kind = AccountKind.Liability,     IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.PayoutPending,            AccountName = "Payout Pending",                   Kind = AccountKind.Liability,     IsPerUser = true  },
            new FinancialAccount { AccountCode = LedgerAccountCode.PayoutFees,               AccountName = "Payout Fees",                      Kind = AccountKind.Expense,       IsPerUser = false },
            new FinancialAccount { AccountCode = LedgerAccountCode.InstructorFundedDiscount, AccountName = "Instructor-Funded Discount",       Kind = AccountKind.ContraRevenue, IsPerUser = true  },
            new FinancialAccount { AccountCode = LedgerAccountCode.PlatformFundedDiscount,   AccountName = "Platform-Funded Discount",         Kind = AccountKind.ContraRevenue, IsPerUser = false },
        };

        var toAdd = accounts.Where(a => !existingCodes.Contains(a.AccountCode)).ToList();
        if (toAdd.Count > 0)
        {
            _context.FinancialAccounts.AddRange(toAdd);
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedRevenueSharePlansAsync()
    {
        var epoch = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        var desired = new[]
        {
            new { Channel = SalesChannel.Organic,          InstructorPercentage = 0.37m },
            new { Channel = SalesChannel.InstructorCoupon, InstructorPercentage = 0.97m },
            new { Channel = SalesChannel.PlatformCoupon,   InstructorPercentage = 0.37m },
        };

        var existingPlans = _context.RevenueSharePlans.ToList();

        foreach (var d in desired)
        {
            var plan = existingPlans.FirstOrDefault(p => p.Channel == d.Channel);
            if (plan == null)
            {
                _context.RevenueSharePlans.Add(new RevenueSharePlan
                {
                    Channel = d.Channel,
                    InstructorPercentage = d.InstructorPercentage,
                    EffectiveFrom = epoch,
                    IsActive = true
                });
            }
            else
            {
                plan.InstructorPercentage = d.InstructorPercentage;
                plan.IsActive = true;
            }
        }

        await _context.SaveChangesAsync();
    }
}
