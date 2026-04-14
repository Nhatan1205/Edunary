using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;

namespace Edunary.Application.SystemSettings.Commands.UpdateSystemSettingsCommand;

public class UpdateSystemSettingsCommand : IRequest<Result>
{
    public List<UpdateSettingItem> Settings { get; init; } = new();
}

public class UpdateSystemSettingsCommandHandler : IRequestHandler<UpdateSystemSettingsCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateSystemSettingsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateSystemSettingsCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var requestedKeys = request.Settings.Select(s => s.Key).ToList();

            var existingSettings = await _context.SystemSettings
                .Where(s => requestedKeys.Contains(s.Key))
                .ToListAsync(cancellationToken);

            foreach (var item in request.Settings)
            {
                var setting = existingSettings.FirstOrDefault(s => s.Key == item.Key);
                Guard.Against.NotFound(item.Key, setting);

                setting.Value = item.Value;
            }

            var result = await _context.SaveChangesAsync(cancellationToken);
            if (result > 0)
            {
                return Result.Success(message: "Settings updated successfully.");
            }

            return Result.Failure("Settings update failed.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"An error occurred: {ex.Message}");
        }
    }
}
