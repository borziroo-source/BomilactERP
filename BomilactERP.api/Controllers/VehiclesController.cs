using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<VehiclesController> _logger;

    public VehiclesController(BomilactDbContext context, ILogger<VehiclesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehicleDto>>> GetAll()
    {
        try
        {
            var vehicles = await _context.Vehicles
                .Include(v => v.Compartments)
                .OrderBy(v => v.PlateNumber)
                .ToListAsync();

            return Ok(vehicles.Select(MapVehicle));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching vehicles");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehicleDto>> GetById(int id)
    {
        try
        {
            var vehicle = await _context.Vehicles
                .Include(v => v.Compartments)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vehicle == null)
            {
                return NotFound();
            }

            return Ok(MapVehicle(vehicle));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching vehicle {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<VehicleDto>> Create(CreateVehicleDto dto)
    {
        try
        {
            if (!TryParseVehicleType(dto.Type, out var vehicleType))
            {
                return BadRequest(new { message = "Invalid vehicle type" });
            }

            if (!TryParseVehicleStatus(dto.Status, out var vehicleStatus))
            {
                return BadRequest(new { message = "Invalid vehicle status" });
            }

            if (!TryParseDate(dto.ItpExpiry, out var itpExpiry) || !TryParseDate(dto.RcaExpiry, out var rcaExpiry))
            {
                return BadRequest(new { message = "Invalid document expiry date" });
            }

            var vehicle = new Vehicle
            {
                PlateNumber = dto.PlateNumber.Trim().ToUpperInvariant(),
                MakeModel = dto.MakeModel.Trim(),
                Type = vehicleType,
                Status = vehicleStatus,
                TotalCapacityLiters = dto.TotalCapacityLiters,
                ItpExpiry = itpExpiry,
                RcaExpiry = rcaExpiry,
                LastWashTime = TryParseDateTime(dto.LastWashTime),
                MileageKm = dto.MileageKm,
                Compartments = dto.Compartments?.Select(c => new VehicleCompartment
                {
                    CapacityLiters = c.CapacityLiters,
                    CurrentContent = c.CurrentContent
                }).ToList() ?? new List<VehicleCompartment>()
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, MapVehicle(vehicle));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating vehicle");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateVehicleDto dto)
    {
        try
        {
            var vehicle = await _context.Vehicles.Include(v => v.Compartments).FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null)
            {
                return NotFound();
            }

            if (!TryParseVehicleType(dto.Type, out var vehicleType))
            {
                return BadRequest(new { message = "Invalid vehicle type" });
            }

            if (!TryParseVehicleStatus(dto.Status, out var vehicleStatus))
            {
                return BadRequest(new { message = "Invalid vehicle status" });
            }

            if (!TryParseDate(dto.ItpExpiry, out var itpExpiry) || !TryParseDate(dto.RcaExpiry, out var rcaExpiry))
            {
                return BadRequest(new { message = "Invalid document expiry date" });
            }

            vehicle.PlateNumber = dto.PlateNumber.Trim().ToUpperInvariant();
            vehicle.MakeModel = dto.MakeModel.Trim();
            vehicle.Type = vehicleType;
            vehicle.Status = vehicleStatus;
            vehicle.TotalCapacityLiters = dto.TotalCapacityLiters;
            vehicle.ItpExpiry = itpExpiry;
            vehicle.RcaExpiry = rcaExpiry;
            vehicle.LastWashTime = TryParseDateTime(dto.LastWashTime);
            vehicle.MileageKm = dto.MileageKm;
            vehicle.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating vehicle {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id:int}/documents")]
    public async Task<IActionResult> UpdateDocuments(int id, VehicleDocumentUpdateDto dto)
    {
        try
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null)
            {
                return NotFound();
            }

            if (dto.ItpExpiry != null)
            {
                if (!TryParseDate(dto.ItpExpiry, out var itpExpiry))
                {
                    return BadRequest(new { message = "Invalid ITP expiry date" });
                }
                vehicle.ItpExpiry = itpExpiry;
            }

            if (dto.RcaExpiry != null)
            {
                if (!TryParseDate(dto.RcaExpiry, out var rcaExpiry))
                {
                    return BadRequest(new { message = "Invalid RCA expiry date" });
                }
                vehicle.RcaExpiry = rcaExpiry;
            }

            vehicle.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating vehicle documents {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost("{id:int}/wash-logs")]
    public async Task<ActionResult<VehicleDto>> AddWashLog(int id, CreateWashLogDto dto)
    {
        try
        {
            var vehicle = await _context.Vehicles.Include(v => v.Compartments).FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null)
            {
                return NotFound();
            }

            var log = new WashLog
            {
                VehicleId = id,
                Timestamp = TryParseDateTime(dto.Timestamp) ?? DateTime.UtcNow,
                PerformedBy = dto.PerformedBy.Trim(),
                Chemicals = string.Join(',', dto.Chemicals ?? Array.Empty<string>()),
                Temperature = dto.Temperature
            };

            _context.WashLogs.Add(log);

            vehicle.Status = VehicleStatus.ReadyToCollect;
            vehicle.LastWashTime = log.Timestamp;
            vehicle.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapVehicle(vehicle));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding wash log for vehicle {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id:int}/wash-logs")]
    public async Task<ActionResult<IEnumerable<WashLogDto>>> GetWashLogs(int id)
    {
        try
        {
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.Id == id);
            if (!vehicleExists)
            {
                return NotFound();
            }

            var logs = await _context.WashLogs
                .Where(w => w.VehicleId == id)
                .OrderByDescending(w => w.Timestamp)
                .ToListAsync();

            return Ok(logs.Select(MapWashLog));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching wash logs for vehicle {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null)
            {
                return NotFound();
            }

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting vehicle {VehicleId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    private static VehicleDto MapVehicle(Vehicle vehicle)
    {
        return new VehicleDto
        {
            Id = vehicle.Id,
            PlateNumber = vehicle.PlateNumber,
            MakeModel = vehicle.MakeModel,
            Type = ToVehicleTypeKey(vehicle.Type),
            Status = ToVehicleStatusKey(vehicle.Status),
            TotalCapacityLiters = vehicle.TotalCapacityLiters,
            Compartments = vehicle.Compartments.Select(c => new VehicleCompartmentDto
            {
                Id = c.Id,
                CapacityLiters = c.CapacityLiters,
                CurrentContent = c.CurrentContent
            }).ToList(),
            ItpExpiry = vehicle.ItpExpiry.ToString("yyyy-MM-dd"),
            RcaExpiry = vehicle.RcaExpiry.ToString("yyyy-MM-dd"),
            LastWashTime = vehicle.LastWashTime?.ToString("O"),
            MileageKm = vehicle.MileageKm
        };
    }

    private static WashLogDto MapWashLog(WashLog log)
    {
        return new WashLogDto
        {
            Id = log.Id,
            VehicleId = log.VehicleId,
            Timestamp = log.Timestamp.ToString("O"),
            PerformedBy = log.PerformedBy,
            Chemicals = string.IsNullOrWhiteSpace(log.Chemicals)
                ? Array.Empty<string>()
                : log.Chemicals.Split(',', StringSplitOptions.RemoveEmptyEntries),
            Temperature = log.Temperature
        };
    }

    private static bool TryParseVehicleType(string value, out VehicleType vehicleType)
    {
        vehicleType = VehicleType.MilkTanker;
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        switch (value.Trim().ToUpperInvariant())
        {
            case "MILK_TANKER":
                vehicleType = VehicleType.MilkTanker;
                return true;
            case "REEFER_TRUCK":
                vehicleType = VehicleType.ReeferTruck;
                return true;
            case "PASSENGER":
                vehicleType = VehicleType.Passenger;
                return true;
            default:
                return Enum.TryParse(value, true, out vehicleType);
        }
    }

    private static bool TryParseVehicleStatus(string value, out VehicleStatus vehicleStatus)
    {
        vehicleStatus = VehicleStatus.ReadyToCollect;
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        switch (value.Trim().ToUpperInvariant())
        {
            case "READY_TO_COLLECT":
                vehicleStatus = VehicleStatus.ReadyToCollect;
                return true;
            case "DIRTY":
                vehicleStatus = VehicleStatus.Dirty;
                return true;
            case "MAINTENANCE":
                vehicleStatus = VehicleStatus.Maintenance;
                return true;
            case "OUT_OF_SERVICE":
                vehicleStatus = VehicleStatus.OutOfService;
                return true;
            default:
                return Enum.TryParse(value, true, out vehicleStatus);
        }
    }

    private static string ToVehicleTypeKey(VehicleType vehicleType)
    {
        return vehicleType switch
        {
            VehicleType.MilkTanker => "MILK_TANKER",
            VehicleType.ReeferTruck => "REEFER_TRUCK",
            VehicleType.Passenger => "PASSENGER",
            _ => vehicleType.ToString().ToUpperInvariant()
        };
    }

    private static string ToVehicleStatusKey(VehicleStatus vehicleStatus)
    {
        return vehicleStatus switch
        {
            VehicleStatus.ReadyToCollect => "READY_TO_COLLECT",
            VehicleStatus.Dirty => "DIRTY",
            VehicleStatus.Maintenance => "MAINTENANCE",
            VehicleStatus.OutOfService => "OUT_OF_SERVICE",
            _ => vehicleStatus.ToString().ToUpperInvariant()
        };
    }

    private static bool TryParseDate(string value, out DateTime date)
    {
        return DateTime.TryParse(value, out date);
    }

    private static DateTime? TryParseDateTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateTime.TryParse(value, out var date) ? date : null;
    }
}
