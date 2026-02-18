using System.ComponentModel.DataAnnotations;

namespace BomilactERP.api.DTOs;

public class PartnerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePartnerDto
{
    [Required(ErrorMessage = "A név megadása kötelező")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "A név hossza 2 és 200 karakter között kell legyen")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Az adószám megadása kötelező")]
    [StringLength(50, ErrorMessage = "Az adószám maximum 50 karakter lehet")]
    public string TaxNumber { get; set; } = string.Empty;
    
    [StringLength(200, ErrorMessage = "A cím maximum 200 karakter lehet")]
    public string? Address { get; set; }
    
    [StringLength(100, ErrorMessage = "A város maximum 100 karakter lehet")]
    public string? City { get; set; }
    
    [StringLength(20, ErrorMessage = "Az irányítószám maximum 20 karakter lehet")]
    public string? PostalCode { get; set; }
    
    [StringLength(100, ErrorMessage = "Az ország maximum 100 karakter lehet")]
    public string? Country { get; set; }
    
    [StringLength(100, ErrorMessage = "A kapcsolattartó neve maximum 100 karakter lehet")]
    public string? ContactPerson { get; set; }
    
    [EmailAddress(ErrorMessage = "Érvénytelen email cím formátum")]
    [StringLength(100, ErrorMessage = "Az email maximum 100 karakter lehet")]
    public string? Email { get; set; }
    
    [Phone(ErrorMessage = "Érvénytelen telefonszám formátum")]
    [StringLength(30, ErrorMessage = "A telefonszám maximum 30 karakter lehet")]
    public string? Phone { get; set; }
    
    [Required(ErrorMessage = "A partner típus megadása kötelező")]
    [Range(0, 2, ErrorMessage = "Érvénytelen partner típus")]
    public int Type { get; set; }
}

public class UpdatePartnerDto
{
    [Required(ErrorMessage = "A név megadása kötelező")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "A név hossza 2 és 200 karakter között kell legyen")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Az adószám megadása kötelező")]
    [StringLength(50, ErrorMessage = "Az adószám maximum 50 karakter lehet")]
    public string TaxNumber { get; set; } = string.Empty;
    
    [StringLength(200, ErrorMessage = "A cím maximum 200 karakter lehet")]
    public string? Address { get; set; }
    
    [StringLength(100, ErrorMessage = "A város maximum 100 karakter lehet")]
    public string? City { get; set; }
    
    [StringLength(20, ErrorMessage = "Az irányítószám maximum 20 karakter lehet")]
    public string? PostalCode { get; set; }
    
    [StringLength(100, ErrorMessage = "Az ország maximum 100 karakter lehet")]
    public string? Country { get; set; }
    
    [StringLength(100, ErrorMessage = "A kapcsolattartó neve maximum 100 karakter lehet")]
    public string? ContactPerson { get; set; }
    
    [EmailAddress(ErrorMessage = "Érvénytelen email cím formátum")]
    [StringLength(100, ErrorMessage = "Az email maximum 100 karakter lehet")]
    public string? Email { get; set; }
    
    [Phone(ErrorMessage = "Érvénytelen telefonszám formátum")]
    [StringLength(30, ErrorMessage = "A telefonszám maximum 30 karakter lehet")]
    public string? Phone { get; set; }
    
    [Required(ErrorMessage = "A partner típus megadása kötelező")]
    [Range(0, 2, ErrorMessage = "Érvénytelen partner típus")]
    public int Type { get; set; }
    
    public bool IsActive { get; set; }
}
