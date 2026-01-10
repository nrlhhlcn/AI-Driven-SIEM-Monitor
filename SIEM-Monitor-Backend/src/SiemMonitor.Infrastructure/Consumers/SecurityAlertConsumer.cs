using MassTransit;
using SiemMonitor.Core.Events;

namespace SiemMonitor.Infrastructure.Consumers;

public class SecurityAlertConsumer : IConsumer<SecurityAlertCreated>
{
    public Task Consume(ConsumeContext<SecurityAlertCreated> context)
    {
        var message = context.Message;
        Console.WriteLine($"[MassTransit Consumer] ALERT RECEIVED: {message.Message} (Severity: {message.Severity})");
        return Task.CompletedTask;
    }
}
