namespace Edunary.Application.FunctionalTests;

public static class TestDatabaseFactory
{
    public static async Task<ITestDatabase> CreateAsync()
    {
        // Testcontainers requires Docker. To use a local SQL Server database instead,
        // switch to `SQLServerTestDatabase`.
        var database = new TestcontainersTestDatabase();

        await database.InitialiseAsync();

        return database;
    }
}
