param(
  [Parameter(Mandatory = $true)]
  [string]$Theme,
  [int]$Port = 4173,
  [switch]$NoBuild,
  [switch]$SyncPosts,
  [switch]$InstallTheme,
  [switch]$Inline
)

Push-Location $PSScriptRoot\..
try {
  $registry = Get-Content themes\registry.json -Raw | ConvertFrom-Json
  $themeConfig = $registry | Where-Object { $_.id -eq $Theme } | Select-Object -First 1

  if (-not $themeConfig) {
    throw "Unknown theme '$Theme'. Check themes\\registry.json."
  }

  $themePath = Join-Path $PWD "themes\$Theme"
  $projectPath = if ($themeConfig.project_path) {
    Join-Path $themePath $themeConfig.project_path
  } else {
    $themePath
  }

  if ($SyncPosts) {
    Write-Host "Syncing posts for $Theme..."
    npm run posts:sync -- --theme $Theme | Out-Default
  }

  if ($InstallTheme -or -not (Test-Path $projectPath)) {
    Write-Host "Installing $Theme..."
    npm run theme:install -- $Theme | Out-Default
  }

  if ($themeConfig.build_host) {
    Write-Host "Building $Theme on the host before launching the container..."
    $packageJsonPath = Join-Path $projectPath "package.json"
    $packageManager = "npm"
    $npmInstallFlags = "--legacy-peer-deps"

    if (Test-Path $packageJsonPath) {
      $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
      if ($packageJson.packageManager) {
        $packageManager = ($packageJson.packageManager -split "@")[0]
      }
    }
    elseif (Test-Path (Join-Path $projectPath "pnpm-lock.yaml")) {
      $packageManager = "pnpm"
    }

    Push-Location $projectPath
    try {
      if ($packageManager -eq "pnpm") {
        pnpm install | Out-Default
        pnpm build | Out-Default
      }
      else {
        npm install $npmInstallFlags | Out-Default
        npm run build | Out-Default
      }
    }
    finally {
      Pop-Location
    }
  }

  $projectName = "andybevan-$Theme"
  $containerProjectPath = if ($themeConfig.project_path) {
    "/app/themes/$Theme/$($themeConfig.project_path)"
  } else {
    "/app/themes/$Theme"
  }
  $projectNodeModulesPath = "$containerProjectPath/node_modules"
  if ($NoBuild) {
    $composeArgs = "docker compose -p $projectName up"
  }
  else {
    $composeArgs = "docker compose -p $projectName up --build"
  }
  $command = @"
Set-Location '{0}'
`$env:THEME_PORT={1}
`$env:THEME_ID='{2}'
`$env:THEME_NPM_FLAGS='--legacy-peer-deps'
`$env:THEME_NODE_MODULES_PATH='{3}'
`$env:THEME_SKIP_BUILD='{4}'
{5}
"@ -f $PWD, $Port, $Theme, $projectNodeModulesPath, $([string]([bool]$themeConfig.build_host)).ToLower(), $composeArgs

  Write-Host "Launching $Theme on port $Port..."
  if ($Inline) {
    & pwsh -Command $command.Trim()
  }
  else {
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $command.Trim() -WorkingDirectory $PWD
  }
}
finally {
  Pop-Location
}
