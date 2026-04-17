#!/usr/bin/env pwsh
# Ralph Wiggum Loop -- GitHub Copilot CLI + OpenSpec
#
# Requirements:
#   winget install GitHub.Copilot
#   npm install -g @fission-ai/openspec@latest
#
# Usage:
#   .\loop.ps1          # unlimited (Ctrl+C to stop)
#   .\loop.ps1 10       # max 10 iterations

param([int]$MaxIterations = 0)

function Get-NextTask {
    $taskFiles = Get-ChildItem -Path "openspec/changes" -Filter "tasks.md" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\archive\\" }
    foreach ($file in $taskFiles) {
        $next = Get-Content $file.FullName | Where-Object { $_ -match '^\s*-\s+\[ \]' } | Select-Object -First 1
        if ($next) { return @{ Task = $next.Trim(); File = $file.FullName } }
    }
    return $null
}

function Get-PendingCount {
    $count = 0
    Get-ChildItem -Path "openspec/changes" -Filter "tasks.md" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\archive\\" } |
        ForEach-Object { $count += (Get-Content $_.FullName | Where-Object { $_ -match '^\s*-\s+\[ \]' }).Count }
    return $count
}

function Show-SpecProgress($tasksFile) {
    $lines = Get-Content $tasksFile -ErrorAction SilentlyContinue
    if (-not $lines) { return }
    $currentSpec = "General"; $done = 0; $total = 0
    foreach ($line in $lines) {
        if ($line -match '^##\s+(.+)') {
            if ($total -gt 0) {
                $pct = [int](($done / $total) * 100)
                $bar = "#" * [int]($pct / 10) + "-" * (10 - [int]($pct / 10))
                Write-Host "  [$bar] $done/$total  $currentSpec" -ForegroundColor Cyan
            }
            $currentSpec = $Matches[1]; $done = 0; $total = 0
        }
        if ($line -match '^\s*-\s+\[x\]') { $done++; $total++ }
        if ($line -match '^\s*-\s+\[ \]') { $total++ }
    }
    if ($total -gt 0) {
        $pct = [int](($done / $total) * 100)
        $bar = "#" * [int]($pct / 10) + "-" * (10 - [int]($pct / 10))
        Write-Host "  [$bar] $done/$total  $currentSpec" -ForegroundColor Cyan
    }
}

function Assert-SpecHeaders {
    $taskFiles = Get-ChildItem -Path "openspec/changes" -Filter "tasks.md" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "\\archive\\" }
    foreach ($file in $taskFiles) {
        $specDirs = Get-ChildItem -Path (Join-Path (Split-Path $file.FullName) "specs") -Directory -ErrorAction SilentlyContinue
        if ($specDirs.Count -gt 1) {
            $content = Get-Content $file.FullName -Raw
            if ($content -notmatch '(?m)^##\s+\w') {
                Write-Host "`n⚠️  tasks.md has multiple specs but no ## <spec-name> headers." -ForegroundColor Yellow
                Write-Host "   Add a '## <spec-name>' section header per spec, then restart." -ForegroundColor Yellow
                Write-Host "   File: $($file.FullName)" -ForegroundColor Yellow
                exit 1
            }
        }
    }
}

$branch = git branch --show-current 2>$null
$i = 0

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🐣 Ralph Wiggum Loop" -ForegroundColor Cyan
Write-Host "   Branch: $branch" -ForegroundColor Cyan
if ($MaxIterations -gt 0) { Write-Host "   Max: $MaxIterations iterations" -ForegroundColor Cyan }
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (-not (Test-Path "openspec/changes")) {
    Write-Host "`n⚠️  No openspec folder found. Follow Step 1 in README.md first." -ForegroundColor Yellow
    exit 1
}

Assert-SpecHeaders

while ($true) {
    if ($MaxIterations -gt 0 -and $i -ge $MaxIterations) {
        Write-Host "`n🏁 Max iterations reached: $MaxIterations" -ForegroundColor Yellow; break
    }

    $next = Get-NextTask
    if (-not $next) {
        Write-Host "`n🎉 All tasks done! Don't forget to archive." -ForegroundColor Green; break
    }

    $remaining = Get-PendingCount
    Write-Host "`n══════════ LOOP $($i+1)  ($remaining tasks remaining) ══════════" -ForegroundColor Green
    Write-Host "📊 Progress:" -ForegroundColor Cyan
    Show-SpecProgress $next.File
    Write-Host "📋 Next task:" -ForegroundColor Cyan
    Write-Host "   $($next.Task)" -ForegroundColor White
    Write-Host ""

    copilot --experimental --yolo --agent ralph --prompt "implement the next task"

    Write-Host "`n📤 Pushing..." -ForegroundColor Cyan
    git push origin $branch 2>$null
    if ($LASTEXITCODE -ne 0) { git push -u origin $branch }

    $i++
    $remaining = Get-PendingCount
    if ($remaining -eq 0) {
        Write-Host "`n🎉 All tasks done!" -ForegroundColor Green; break
    }
}

Write-Host "`n✅ Ralph loop finished after $i iteration(s)." -ForegroundColor Cyan
