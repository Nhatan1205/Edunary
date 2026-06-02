using Edunary.Domain.Entities;
using Edunary.Domain.Enums;

namespace Edunary.Application.Payments.Commands.ConfirmPaymentCommand;

public static class InstructorShareAllocator
{
    public static InstructorShareAllocation Allocate(
        decimal instructorPayout,
        string ownerId,
        IEnumerable<CourseCollaborator> collaborators)
    {
        var payout = RoundMoney(Math.Max(0m, instructorPayout));
        var eligibleCollaborators = collaborators
            .Where(c => c.InviteStatus == CollaboratorInviteStatus.Accepted
                     && c.RevenueSharePercent > 0m
                     && c.UserId != ownerId)
            .GroupBy(c => c.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                Percent = g.Sum(c => c.RevenueSharePercent)
            })
            .Where(c => c.Percent > 0m)
            .ToList();

        var totalPercent = eligibleCollaborators.Sum(c => c.Percent);
        var denominator = totalPercent > 100m ? totalPercent : 100m;

        var collaboratorShares = eligibleCollaborators
            .Select(c => new CollaboratorShare(
                c.UserId,
                RoundMoney(payout * (c.Percent / denominator))))
            .Where(c => c.Amount > 0m)
            .ToList();

        CapCollaboratorTotal(collaboratorShares, payout);

        var collaboratorTotal = collaboratorShares.Sum(c => c.Amount);
        var ownerAmount = RoundMoney(Math.Max(0m, payout - collaboratorTotal));

        return new InstructorShareAllocation(
            ownerId,
            ownerAmount,
            collaboratorShares,
            totalPercent,
            totalPercent > 100m);
    }

    private static decimal RoundMoney(decimal amount)
        => Math.Round(amount, 2, MidpointRounding.ToEven);

    private static void CapCollaboratorTotal(List<CollaboratorShare> collaboratorShares, decimal payout)
    {
        var overage = RoundMoney(collaboratorShares.Sum(c => c.Amount) - payout);
        if (overage <= 0m)
            return;

        for (var i = collaboratorShares.Count - 1; i >= 0 && overage > 0m; i--)
        {
            var current = collaboratorShares[i];
            var reduction = Math.Min(current.Amount, overage);
            var adjustedAmount = RoundMoney(current.Amount - reduction);
            collaboratorShares[i] = current with { Amount = adjustedAmount };
            overage = RoundMoney(overage - reduction);
        }

        collaboratorShares.RemoveAll(c => c.Amount <= 0m);
    }
}

public record CollaboratorShare(string UserId, decimal Amount);

public record InstructorShareAllocation(
    string OwnerId,
    decimal OwnerAmount,
    IReadOnlyList<CollaboratorShare> Collaborators,
    decimal TotalCollaboratorSharePercent,
    bool WasNormalized)
{
    public decimal TotalAmount => OwnerAmount + Collaborators.Sum(c => c.Amount);

    public IEnumerable<(string UserId, decimal Amount)> Recipients()
    {
        if (OwnerAmount > 0m)
            yield return (OwnerId, OwnerAmount);

        foreach (var collaborator in Collaborators.Where(c => c.Amount > 0m))
            yield return (collaborator.UserId, collaborator.Amount);
    }
}
