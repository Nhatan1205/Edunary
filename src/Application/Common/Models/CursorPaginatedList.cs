using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Application.Common.Models;

public class CursorPaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; init; }
    public bool HasMore { get; init; }

    [System.Text.Json.Serialization.JsonConstructor]
    public CursorPaginatedList() { }

    public CursorPaginatedList(IReadOnlyCollection<T> items, bool hasMore)
    {
        Items = items;
        HasMore = hasMore;
    }

    public static async Task<CursorPaginatedList<T>> CreateAsync(
        IQueryable<T> source,
        Expression<Func<T, bool>> cursorPredicate,
        int pageSize)
    {
        var query = source;

        if (cursorPredicate != null)
        {
            query = query.Where(cursorPredicate);
        }

        var items = await query.Take(pageSize + 1).ToListAsync();
        var hasMore = items.Count > pageSize;

        if (hasMore)
        {
            items.RemoveAt(items.Count - 1);
        }

        return new CursorPaginatedList<T>(items.AsReadOnly(), hasMore);
    }
}
