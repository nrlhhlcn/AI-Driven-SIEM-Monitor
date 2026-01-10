namespace SiemMonitor.Core.Services;

public interface IAlertService
{
    Task CreateAlertAsync(string message, string severity);
}
