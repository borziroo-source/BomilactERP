# BomilactERP Dev Menu
$FrontendDir  = "$PSScriptRoot\frontend"
$BackendDir   = "$PSScriptRoot\BomilactERP.api"
$FrontendPort = 3000
$BackendPort  = 7102

# OSC 8 hyperlink helper (works in Windows Terminal and most modern terminals)
function Write-Link($label, $url) {
    $esc = [char]27
    Write-Host ("    $esc]8;;$url$esc\$label$esc]8;;$esc\  ") -ForegroundColor DarkCyan -NoNewline
    Write-Host $url -ForegroundColor DarkGray
}

function Get-PortStatus($port) {
    $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

function Write-FrontendLinks {
    $b = "http://localhost:$FrontendPort"
    Write-Host "  Frontend linkek:" -ForegroundColor Cyan
    Write-Link "App (fooldal)"    $b
    Write-Link "Dashboard"        $b
    Write-Link "Logistics"        $b
    Write-Link "Production"       $b
    Write-Link "Inventory"        $b
    Write-Link "QA / Lab Tests"   $b
    Write-Link "Sales"            $b
    Write-Link "Finance"          $b
    Write-Link "Admin"            $b
}

function Write-BackendLinks {
    $b = "https://localhost:$BackendPort"
    Write-Host "  Backend linkek:" -ForegroundColor Cyan
    Write-Link "Swagger UI"            "$b/swagger/index.html"
    Write-Link "Partners"              "$b/api/Partners"
    Write-Link "Supplier Groups"       "$b/api/SupplierGroups"
    Write-Link "Contracts"             "$b/api/Contracts"
    Write-Link "Milk Collections"      "$b/api/MilkCollections"
    Write-Link "Milk Coll. Summaries"  "$b/api/MilkCollectionSummaries"
    Write-Link "Lab Tests"             "$b/api/LabTests"
    Write-Link "Vehicles"              "$b/api/Vehicles"
    Write-Link "Orders"                "$b/api/Orders"
    Write-Link "Products"              "$b/api/Products"
    Write-Link "Recipes"               "$b/api/Recipes"
    Write-Link "Production Plans"      "$b/api/ProductionPlans"
    Write-Link "Inventory Items"       "$b/api/InventoryItems"
    Write-Link "Invoices"              "$b/api/Invoices"
    Write-Link "Users"                 "$b/api/Users"
}

function Start-Frontend {
    if (Get-PortStatus $FrontendPort) {
        Write-Host "  Frontend mar fut a(z) $FrontendPort-es porton." -ForegroundColor Yellow
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev"
        Write-Host "  Frontend elindult egy uj ablakban." -ForegroundColor Green
    }
}

function Start-Backend {
    if (Get-PortStatus $BackendPort) {
        Write-Host "  Backend mar fut a(z) $BackendPort-es porton." -ForegroundColor Yellow
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; dotnet run --launch-profile https"
        Write-Host "  Backend elindult egy uj ablakban." -ForegroundColor Green
    }
}

function Show-Menu {
    Clear-Host
    Write-Host "============================================" -ForegroundColor DarkCyan
    Write-Host "        BomilactERP  Dev Menu" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor DarkCyan
    Write-Host ""

    $feRunning = Get-PortStatus $FrontendPort
    $beRunning = Get-PortStatus $BackendPort

    # Frontend status + links
    if ($feRunning) {
        Write-Host "  FRONTEND  [ON]" -ForegroundColor Green
        Write-FrontendLinks
    } else {
        Write-Host "  FRONTEND  [OFF]" -ForegroundColor Red
    }

    Write-Host ""

    # Backend status + links
    if ($beRunning) {
        Write-Host "  BACKEND   [ON]" -ForegroundColor Green
        Write-BackendLinks
    } else {
        Write-Host "  BACKEND   [OFF]" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "--------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  1  Start Frontend        (npm run dev)"
    Write-Host "  2  Start Backend         (dotnet run --launch-profile https)"
    Write-Host "  Q  Quit"
    Write-Host "--------------------------------------------" -ForegroundColor DarkGray
}

do {
    Show-Menu
    $choice = Read-Host "  Valassz"
    Write-Host ""
    switch ($choice.Trim().ToUpper()) {
        "1" { Start-Frontend; Start-Sleep 1 }
        "2" { Start-Backend;  Start-Sleep 1 }
        "Q" { Write-Host "  Viszlat!" -ForegroundColor Cyan }
        default { Write-Host "  Ervenytelen valasztas." -ForegroundColor Yellow; Read-Host "  Nyomj Entert" }
    }
} while ($choice.Trim().ToUpper() -ne "Q")
