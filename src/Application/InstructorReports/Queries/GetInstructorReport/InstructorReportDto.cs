namespace Edunary.Application.InstructorReports.Queries.GetInstructorReport;

public class InstructorReportDto
{
    public bool HasAccess { get; set; }
    public InstructorReportSummaryDto Summary { get; set; } = new();
    public InstructorRevenueTrendDto Revenue { get; set; } = new();
    public InstructorTrendDto Enrollment { get; set; } = new();
    public InstructorTrendDto Rating { get; set; } = new();
    public InstructorTrendDto RatingCount { get; set; } = new();
}

public class InstructorReportSummaryDto
{
    public decimal GrossRevenue { get; set; }
    public decimal WalletEarnings { get; set; }
    public int TotalEnrollments { get; set; }
    public float AverageRating { get; set; }
    public int TotalRatings { get; set; }
}

public class InstructorRevenueTrendDto
{
    public string AggregationLevel { get; set; } = string.Empty;
    public List<InstructorRevenuePointDto> Data { get; set; } = new();
}

public class InstructorRevenuePointDto
{
    public DateTime Date { get; set; }
    public decimal GrossRevenue { get; set; }
    public decimal WalletEarnings { get; set; }
}

public class InstructorTrendDto
{
    public string AggregationLevel { get; set; } = string.Empty;
    public List<ReportDataPointDto> Data { get; set; } = new();
    public decimal Total { get; set; }
}

public class ReportDataPointDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}
