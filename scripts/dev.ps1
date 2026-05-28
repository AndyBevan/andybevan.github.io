param(
  [string]$Theme = "spectre",
  [int]$Port = 4173
)

Push-Location $PSScriptRoot\..
try {
  Write-Host "Syncing posts for themes..."
  & npm run posts:sync
  Write-Host "Installing $Theme..."
  & npm run theme:install -- $Theme
  Write-Host "Enabling $Theme..."
  & npm run theme:enable -- $Theme
  $env:THEME_NPM_FLAGS = "--legacy-peer-deps"
  $env:THEME_PORT = $Port
  Write-Host "Running npm run theme:dev on port $Port..."
  & npm run theme:dev
}
finally {
  Pop-Location
}
