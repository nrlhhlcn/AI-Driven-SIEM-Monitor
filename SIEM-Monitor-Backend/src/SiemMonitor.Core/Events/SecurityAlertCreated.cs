namespace SiemMonitor.Core.Events;

public record SecurityAlertCreated
{
    public string Message { get; init; } = default!;
    public string Severity { get; init; } = default!;
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
