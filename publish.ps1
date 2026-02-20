Write-Host "Publishing P.E.Y.E.K Monorepo packages..." -ForegroundColor Cyan
cd d:\PEYEK\peyek-platform
npm publish --workspaces --access public

Write-Host "Publishing P.E.Y.E.K CLI Scaffolding tool..." -ForegroundColor Cyan
cd d:\PEYEK\create-peyek-app
npm publish --access public

Write-Host "All Packages Published Successfully!" -ForegroundColor Green
