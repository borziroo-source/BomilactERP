using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using BomilactERP.api.Data;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;
using BomilactERP.api.Services;
using Serilog;

// Configure Serilog
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();

try
{
    Log.Information("Starting BomilactERP application");

    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container.
    builder.Host.UseSerilog();

    // Add DbContext
    builder.Services.AddDbContext<BomilactDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Add Microsoft Identity
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<BomilactDbContext>()
    .AddDefaultTokenProviders();

    // Add JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

    // Add generic repository
    builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

    // Add services
    builder.Services.AddScoped<SupplierGroupImportService>();
    builder.Services.AddScoped<JwtService>();

    // Add CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.WithOrigins("http://192.168.5.120:3001", "https://localhost:7102", "https://192.168.5.120:7102", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
    });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
        {
            Type = "string",
            Format = "binary"
        });

        // JWT support in Swagger
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header. Enter 'Bearer {token}'",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    // Run database seed
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<BomilactDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        await db.Database.MigrateAsync();
        await PermissionSeedService.SeedPermissionsAsync(db, roleManager, userManager);
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseSerilogRequestLogging();

    app.UseHttpsRedirection();

    app.UseCors("AllowFrontend");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    Log.Information("BomilactERP application started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
