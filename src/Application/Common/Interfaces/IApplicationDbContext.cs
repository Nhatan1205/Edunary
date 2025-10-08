using Edunary.Domain.Entities;

namespace Edunary.Application.Common.Interfaces;
public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<Payment> Payments { get; }

    DbSet<Order> Orders { get; }

    DbSet<OrderItem> OrderItems { get; }

    public DbSet<Course> Courses { get; }
    public DbSet<Category> Categories { get; }
    public DbSet<Enrollment> Enrollments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
