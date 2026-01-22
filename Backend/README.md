# BomilactERP Backend

ASP.NET Core Web API backend for BomilactERP with Serilog logging implementation.

## Features

- ✅ ASP.NET Core 8.0 Web API
- ✅ Serilog structured logging with multiple sinks
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration
- ✅ Sample REST API controllers (Products, Orders)

## Serilog Configuration

### NuGet Packages
- `Serilog.AspNetCore` - Main Serilog integration
- `Serilog.Sinks.Console` - Console output
- `Serilog.Sinks.File` - File output with rotation
- `Serilog.Enrichers.Environment` - Machine name enricher
- `Serilog.Enrichers.Thread` - Thread ID enricher

### Log Sinks
1. **Console Sink**: Real-time log output to console
2. **Info File Sink**: `Logs/info-{Date}.txt`
   - Daily rotation
   - 30 days retention
   - Minimum level: Information
3. **Errors File Sink**: `Logs/errors-{Date}.txt`
   - Daily rotation
   - 90 days retention
   - Minimum level: Error

### Log Levels
- Default: Information
- Microsoft namespace: Warning
- Entity Framework Core: Information

### Enrichers
- FromLogContext - Contextual log properties
- WithMachineName - Machine/hostname in logs
- WithThreadId - Thread identifier in logs

## Running the Application

### Prerequisites
- .NET 8.0 SDK

### Build
```bash
cd Backend
dotnet restore
dotnet build
```

### Run
```bash
cd Backend
dotnet run
```

The API will be available at:
- HTTP: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

## Logging Implementation

All controllers follow best practices for logging:

1. **Constructor Injection**: `ILogger<T>` injected via constructor
2. **Try/Catch Blocks**: All actions wrapped in try/catch
3. **LogInformation**: Before and after successful operations
4. **LogWarning**: When resources are not found
5. **LogError**: In catch blocks with exception details
6. **Structured Error Response**: 500 status with consistent error message

Example:
```csharp
[HttpGet("{id}")]
public IActionResult GetById(int id)
{
    try
    {
        _logger.LogInformation("Fetching product with ID {ProductId}", id);
        var product = _products.FirstOrDefault(p => p.Id == id);
        
        if (product == null)
        {
            _logger.LogWarning("Product with ID {ProductId} not found", id);
            return NotFound(new { message = $"Product with ID {id} not found" });
        }

        _logger.LogInformation("Successfully fetched product with ID {ProductId}", id);
        return Ok(product);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "An error occurred while fetching product with ID {ProductId}", id);
        return StatusCode(500, new { message = "An error occurred while processing your request" });
    }
}
```

## Log Output Format

```
{Timestamp} [{Level}] [{MachineName}] [{ThreadId}] {Message}{NewLine}{Exception}
```

Example:
```
2026-01-22 05:42:18.337 +00:00 [INF] [runnervmmtnos] [11] Fetching all products
2026-01-22 05:42:18.338 +00:00 [INF] [runnervmmtnos] [11] Successfully fetched 3 products
2026-01-22 05:42:25.813 +00:00 [WRN] [runnervmmtnos] [12] Product with ID 999 not found
```

## Project Structure

```
Backend/
├── Controllers/           # API Controllers
│   ├── ProductsController.cs
│   └── OrdersController.cs
├── Properties/
│   └── launchSettings.json
├── Logs/                 # Log files (auto-created)
│   ├── info-{Date}.txt
│   └── errors-{Date}.txt
├── appsettings.json      # Serilog configuration
├── appsettings.Development.json
├── BomilactERP.csproj
└── Program.cs            # Application entry point
```

## Error Handling

All endpoints return consistent error responses:
- 404 Not Found: `{ "message": "Resource not found" }`
- 400 Bad Request: `{ "message": "Validation error message" }`
- 500 Internal Server Error: `{ "message": "An error occurred while processing your request" }`

All errors are logged with appropriate log levels and exception details.
