using MassTransit;
using SiemMonitor.Core.Events;

namespace SiemMonitor.Core.Services;

public class AlertService : IAlertService
{
    private readonly IPublishEndpoint _publishEndpoint;

    public AlertService(IPublishEndpoint publishEndpoint)
    {
        _publishEndpoint = publishEndpoint;
    }

    public async Task CreateAlertAsync(string message, string severity)
    {
        Console.WriteLine($"[AlertService] Publishing alert to MassTransit: {message} ({severity})");

        await _publishEndpoint.Publish(new SecurityAlertCreated
        {
            Message = message,
            Severity = severity,
            OccurredOn = DateTime.UtcNow
        });
    }
}
