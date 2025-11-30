@echo off
REM MeridianAlgo Setup Script for Windows

echo Setting up MeridianAlgo...

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
echo Installing pnpm...
npm install -g pnpm
)

REM Install dependencies
echo Installing dependencies...
call pnpm install

REM Build all packages
echo Building all packages...
call pnpm build

REM Run tests
echo Running tests...
call pnpm test

echo Setup complete!
echo.
echo Next steps:
echo - Run examples: pnpm example:basic
echo - Read docs: type docs\QUICK-START.md
echo - Start developing: pnpm dev

pause
