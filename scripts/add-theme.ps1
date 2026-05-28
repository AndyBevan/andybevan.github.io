param(
  [Parameter(Mandatory = $true)]
  [string]$Id,
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [Parameter(Mandatory = $true)]
  [string]$Repo,
  [Parameter(Mandatory = $true)]
  [string]$Demo,
  [string]$Description = "Astro theme added via local theme manager.",
  [string]$Branch = "main",
  [string]$ProjectPath,
  [string]$PostsFolder,
  [int]$Port = 4173,
  [switch]$NoBuild,
  [switch]$NoLaunch,
  [switch]$Inline
)

Push-Location $PSScriptRoot\..
try {
  $registryPath = Join-Path $PWD "themes\registry.json"
  $registry = @(Get-Content $registryPath -Raw | ConvertFrom-Json)
  $existing = $registry | Where-Object { $_.id -eq $Id } | Select-Object -First 1

  if ($existing) {
    Write-Host "Theme '$Id' already exists in themes\\registry.json."
  }
  else {
    $entry = [ordered]@{
      id = $Id
      name = $Name
      description = $Description
      repo = $Repo
      branch = $Branch
      demo = $Demo
    }

    if ($ProjectPath) {
      $entry.project_path = $ProjectPath
    }

    if ($PostsFolder) {
      $entry.posts_folder = $PostsFolder
    }

    $updatedRegistry = @($registry) + [pscustomobject]$entry
    $updatedRegistry | ConvertTo-Json -Depth 6 | Set-Content $registryPath
    Write-Host "Added '$Id' to themes\\registry.json."
  }

  $launchArgs = @(
    "-NoProfile"
    "-File"
    (Join-Path $PWD "scripts\run-theme-container.ps1")
    "-Theme"
    $Id
    "-Port"
    $Port
    "-InstallTheme"
  )

  if ($PostsFolder) {
    $launchArgs += "-SyncPosts"
  }

  if ($NoBuild) {
    $launchArgs += "-NoBuild"
  }

  if ($Inline) {
    $launchArgs += "-Inline"
  }

  if (-not $NoLaunch) {
    & pwsh @launchArgs
  }
}
finally {
  Pop-Location
}
