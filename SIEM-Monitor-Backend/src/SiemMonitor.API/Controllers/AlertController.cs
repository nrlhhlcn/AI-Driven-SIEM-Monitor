using Microsoft.AspNetCore.Mvc;
using SiemMonitor.Core.Services;

namespace SiemMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAlert([FromBody] CreateAlertRequest request)
    {
        await _alertService.CreateAlertAsync(request.Message, request.Severity);
        return Ok(new { Message = "Alert triggered and event published." });
    }
}

public record CreateAlertRequest(string Message, string Severity);
