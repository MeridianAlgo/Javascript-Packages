# Update all tsconfig.json files to exclude test files
$packages = Get-ChildItem -Path "packages" -Directory

foreach ($pkg in $packages) {
    $tsconfigPath = Join-Path $pkg.FullName "tsconfig.json"
    
    if (Test-Path $tsconfigPath) {
        Write-Host "Updating $($pkg.Name)..."
        
        $json = Get-Content $tsconfigPath -Raw | ConvertFrom-Json
        
        # Add exclude if not present or update it
        if (-not $json.exclude) {
            $json | Add-Member -MemberType NoteProperty -Name "exclude" -Value @("**/*.test.ts", "**/*.spec.ts") -Force
        } else {
            # If exclude exists, ensure test files are in it
            $exclude = $json.exclude
            if ($exclude -notcontains "**/*.test.ts") {
                $exclude += "**/*.test.ts"
            }
            if ($exclude -notcontains "**/*.spec.ts") {
                $exclude += "**/*.spec.ts"
            }
            $json.exclude = $exclude
        }
        
        # Save updated tsconfig.json
        $json | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath
        
        Write-Host "  ✓ Updated $($pkg.Name)"
    }
}

Write-Host "`nAll tsconfig.json files updated!"
