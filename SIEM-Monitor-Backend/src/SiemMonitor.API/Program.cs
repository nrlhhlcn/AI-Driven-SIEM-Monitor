using MassTransit;
using SiemMonitor.Core.Services;
using SiemMonitor.Infrastructure.Consumers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Core Services
builder.Services.AddScoped<IAlertService, AlertService>();

// MassTransit Configuration
var rabbitMqUrl = builder.Configuration["RABBITMQ_URL"];

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<SecurityAlertConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(new Uri(rabbitMqUrl!));

        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
