param(
  [int]$StartPort = 4173,
  [string]$Themes,
  [switch]$OnlyRunning,
  [string]$ChromePath
)

Push-Location $PSScriptRoot\..
try {
  if (-not $ChromePath) {
    $ChromePath = @(
      "C:\Program Files\Google\Chrome\Application\chrome.exe",
      "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
      (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
  }

  if (-not $ChromePath) {
    throw "Chrome executable not found."
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

  $urls = @()
  for ($i = 0; $i -lt $selected.Count; $i++) {
    $theme = $selected[$i]
    $port = $StartPort + $i
    $url = "http://127.0.0.1:$port"

    if ($OnlyRunning) {
      try {
        $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
      }
      catch {
        Write-Host "Skipping $($theme.id) on $url (not responding)"
        continue
      }
    }

    Write-Host "Opening $($theme.id) -> $url"
    $urls += $url
  }

  if (-not $urls.Count) {
    throw "No URLs to open."
  }

  Start-Process -FilePath $ChromePath -ArgumentList $urls
}
finally {
  Pop-Location
}
