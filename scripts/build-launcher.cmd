@echo off
setlocal
REM Compiles ORPG-Host.exe from host-launcher.cs using the C# compiler that
REM ships with the .NET Framework on Windows (no extra tooling required).

set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist "%CSC%" set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if not exist "%CSC%" (
  echo [ERROR] C# compiler not found. Is the .NET Framework installed?
  exit /b 1
)

set "ROOT=%~dp0.."
"%CSC%" /nologo /optimize+ /target:exe /out:"%ROOT%\ORPG-Host.exe" "%~dp0host-launcher.cs"
if errorlevel 1 ( echo [ERROR] compile failed & exit /b 1 )

echo [ok] Built %ROOT%\ORPG-Host.exe
