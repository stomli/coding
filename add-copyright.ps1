# PowerShell script to add copyright headers to all JavaScript source files
# Run this from the project root directory

$copyright = @"
/**
 * ============================================================================
 * {0} - Orb•Fall: ChromaCrush
 * ============================================================================
 * Copyright (c) 2025 Tom Stomlinson. All Rights Reserved.
 * ============================================================================
 */

"@

# Get all JS files in src directory
$jsFiles = Get-ChildItem -Path "src" -Filter "*.js" -Recurse

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has copyright
    if ($content -match "Copyright \(c\) 2025") {
        Write-Host "Skipping $($file.Name) - already has copyright" -ForegroundColor Yellow
        continue
    }
    
    # Remove old header if exists
    if ($content -match "^/\*\*[\s\S]*?\*/\s*") {
        $content = $content -replace "^/\*\*[\s\S]*?\*/\s*", ""
    }
    
    # Add new copyright header
    $newContent = ($copyright -f $file.Name) + $content
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    
    Write-Host "Added copyright to $($file.Name)" -ForegroundColor Green
}

Write-Host "`nCopyright headers added successfully!" -ForegroundColor Cyan
