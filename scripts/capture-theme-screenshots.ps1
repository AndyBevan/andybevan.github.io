param(
  [int]$StartPort = 4173,
  [string]$Themes,
  [string]$OutputDir = "data/screenshots",
  [int]$Width = 1440,
  [int]$Height = 960,
  [int]$WaitMs = 1500,
  [int]$TimeoutMs = 30000,
  [switch]$FullPage,
  [switch]$OnlyRunning
)

Push-Location $PSScriptRoot\..
try {
  if (-not (Get-Command playwright -ErrorAction SilentlyContinue)) {
    throw "Playwright CLI was not found on PATH."
  }

  $registry = Get-Content themes\registry.json -Raw | ConvertFrom-Json
  $selected = if ($Themes) {
    $filters = $Themes -split "," | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ }
    $registry | Where-Object { $filters -contains $_.id.ToLowerInvariant() }
  }
  else {
    $registry
  }

  if (-not $selected) {
    throw "No themes matched the requested filters."
  }

  if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  }

  for ($i = 0; $i -lt $selected.Count; $i++) {
    $theme = $selected[$i]
    $index = $i + 1
    $port = $StartPort + $i
    $url = "http://127.0.0.1:$port"
    $filename = "{0}-{1}-{2}.png" -f $index, $port, $theme.id
    $target = Join-Path $OutputDir $filename

    if ($OnlyRunning) {
      try {
        $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec ([Math]::Ceiling($TimeoutMs / 1000))
      }
      catch {
        Write-Host "Skipping $($theme.id) on $url (not responding)"
        continue
      }
    }

    $args = @(
      "screenshot",
      "--browser", "chromium",
      "--channel", "chrome",
      "--device", "Desktop Chrome",
      "--viewport-size", "$Width,$Height",
      "--wait-for-timeout", "$WaitMs",
      "--timeout", "$TimeoutMs",
      $url,
      $target
    )

    if ($FullPage) {
      $args = @("screenshot", "--full-page") + $args[1..($args.Count - 1)]
    }

    Write-Host "Capturing $($theme.id) -> $target"
    & playwright @args
    if ($LASTEXITCODE -ne 0) {
      throw "Screenshot failed for $($theme.id) on $url"
    }
  }
}
finally {
  Pop-Location
}
