param(
  [int]$StartPort = 4173,
  [int]$PortStep = 1,
  [string]$Themes,
  [switch]$NoBuild,
  [switch]$InstallThemes
)

Push-Location $PSScriptRoot\..
try {
  Write-Host "Syncing posts before starting containers..."
  npm run posts:sync | Out-Default

  $registry = Get-Content themes\registry.json -Raw | ConvertFrom-Json
  $selected = @()

  if ($Themes) {
    $filters = $Themes -split "," | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ }
    $selected = $registry | Where-Object { $filters -contains $_.id.ToLowerInvariant() }
  }
  if (-not $selected) {
    $selected = $registry
  }

  $index = 0
  foreach ($theme in $selected) {
    $port = $StartPort + ($index * $PortStep)
    $args = @{
      FilePath = "pwsh"
      WorkingDirectory = $PWD
      ArgumentList = @(
        "-NoExit"
        "-File"
        (Join-Path $PWD "scripts\run-theme-container.ps1")
        "-Theme"
        $theme.id
        "-Port"
        $port
      )
    }

    if ($NoBuild) {
      $args.ArgumentList += "-NoBuild"
    }

    if ($InstallThemes) {
      $args.ArgumentList += "-InstallTheme"
    }

    Write-Host "Launching $($theme.id) on port $port..."
    Start-Process @args

    $index++
  }
}
finally {
  Pop-Location
}
