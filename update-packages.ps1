# Update all package.json files for publishing
$packages = Get-ChildItem -Path "packages" -Directory

foreach ($pkg in $packages) {
    $packageJsonPath = Join-Path $pkg.FullName "package.json"
    
    if (Test-Path $packageJsonPath) {
        Write-Host "Updating $($pkg.Name)..."
        
        $json = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
        
        # Add repository info if not present
        if (-not $json.repository) {
            $json | Add-Member -MemberType NoteProperty -Name "repository" -Value @{
                type = "git"
                url = "https://github.com/MeridianAlgo/Javascript-Packages.git"
                directory = "packages/$($pkg.Name)"
            } -Force
        }
        
        # Add homepage if not present
        if (-not $json.homepage) {
            $json | Add-Member -MemberType NoteProperty -Name "homepage" -Value "https://github.com/MeridianAlgo/Javascript-Packages#readme" -Force
        }
        
        # Add bugs if not present
        if (-not $json.bugs) {
            $json | Add-Member -MemberType NoteProperty -Name "bugs" -Value @{
                url = "https://github.com/MeridianAlgo/Javascript-Packages/issues"
            } -Force
        }
        
        # Add publishConfig for npm
        if (-not $json.publishConfig) {
            $json | Add-Member -MemberType NoteProperty -Name "publishConfig" -Value @{
                access = "public"
                registry = "https://registry.npmjs.org/"
            } -Force
        }
        
        # Add files array if not present
        if (-not $json.files) {
            $json | Add-Member -MemberType NoteProperty -Name "files" -Value @(
                "dist",
                "README.md",
                "LICENSE"
            ) -Force
        }
        
        # Save updated package.json
        $json | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath
        
        Write-Host "  ✓ Updated $($pkg.Name)"
    }
}

Write-Host "`nAll packages updated!"
