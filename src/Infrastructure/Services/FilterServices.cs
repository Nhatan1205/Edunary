using System.Linq.Expressions;
using Edunary.Application.Common.Interfaces;
using Edunary.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Services;
public class FilterService : IFilterService
{
    public IQueryable<T> HandleFilters<T>(IQueryable<T> query, List<FilterData> filters)
    {
        if (filters == null || filters.Count == 0)
            return query;

        foreach (var filter in filters)
        {
            if (string.IsNullOrEmpty(filter.Value)) continue;

            string value = filter.Value.Trim();

            switch (filter.Operation)
            {
                case "Contain":
                    query = query.Where(x =>
                        EF.Property<string>(x, filter.Property).ToLower()
                            .Contains(value.ToLower()));
                    break;

                case "NotContain":
                    query = query.Where(x =>
                        !EF.Property<string>(x, filter.Property).ToLower()
                            .Contains(value.ToLower()));
                    break;

                case "In":
                    {
                        var values = filter.Value.Split(',').Select(v => v.Trim()).ToList();
                        var prop = typeof(T).GetProperty(filter.Property);

                        if (prop?.PropertyType.IsEnum == true)
                        {
                            var enumType = prop.PropertyType;
                            var enumValues = values.Select(v => Enum.Parse(enumType, v)).ToList();

                            query = query.Where(x =>
                                enumValues.Contains(EF.Property<object>(x, filter.Property)));
                        }
                        else if (filter.Type == "int")
                        {
                            var intValues = values.Select(int.Parse).ToList();

                            query = query.Where(x =>
                                intValues.Contains(EF.Property<int>(x, filter.Property)));
                        }
                        break;
                    }

                case "Equals":
                    query = query.Where(x =>
                        EF.Property<string>(x, filter.Property).ToLower() ==
                        value.ToLower());
                    break;

                case "NotEquals":
                    query = query.Where(x =>
                        EF.Property<string>(x, filter.Property).ToLower() !=
                        value.ToLower());
                    break;

                case "GreaterThan":
                    if (filter.Type == "float")
                    {
                        float numValue = float.Parse(value);
                        query = query.Where(x =>
                            EF.Property<float>(x, filter.Property) > numValue);
                    }
                    else if (filter.Type == "int")
                    {
                        int numValue = int.Parse(value);
                        query = query.Where(x =>
                            EF.Property<int>(x, filter.Property) > numValue);
                    }
                    break;

                case "GreaterOrEqual":
                    if (filter.Type == "float")
                    {
                        float numValue = float.Parse(value);
                        query = query.Where(x =>
                            EF.Property<float>(x, filter.Property) >= numValue);
                    }
                    else if (filter.Type == "int")
                    {
                        int numValue = int.Parse(value);
                        query = query.Where(x =>
                            EF.Property<int>(x, filter.Property) >= numValue);
                    }
                    break;

                case "LessThan":
                    if (filter.Type == "float")
                    {
                        float numValue = float.Parse(value);
                        query = query.Where(x =>
                            EF.Property<float>(x, filter.Property) < numValue);
                    }
                    else if (filter.Type == "int")
                    {
                        int numValue = int.Parse(value);
                        query = query.Where(x =>
                            EF.Property<int>(x, filter.Property) < numValue);
                    }
                    break;

                case "LessOrEqual":
                    if (filter.Type == "float")
                    {
                        float numValue = float.Parse(value);
                        query = query.Where(x =>
                            EF.Property<float>(x, filter.Property) <= numValue);
                    }
                    else if (filter.Type == "int")
                    {
                        int numValue = int.Parse(value);
                        query = query.Where(x =>
                            EF.Property<int>(x, filter.Property) <= numValue);
                    }
                    break;
            }
        }

        return query;
    }


}

