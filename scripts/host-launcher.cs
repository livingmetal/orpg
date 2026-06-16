// Tiny native launcher for the ORPG host.
// It simply runs host.cmd (located next to this exe) in a console window,
// so players can double-click ORPG-Host.exe instead of opening a terminal.
//
// Build: scripts\build-launcher.cmd  (uses the C# compiler bundled with Windows)

using System;
using System.Diagnostics;
using System.IO;

internal static class OrpgHostLauncher
{
    private static int Main()
    {
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        string cmd = Path.Combine(dir, "host.cmd");

        if (!File.Exists(cmd))
        {
            Console.Error.WriteLine("host.cmd was not found next to ORPG-Host.exe.");
            Console.Error.WriteLine("Keep ORPG-Host.exe in the project root folder.");
            Console.WriteLine();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
            return 1;
        }

        var psi = new ProcessStartInfo
        {
            FileName = "cmd.exe",
            Arguments = "/c \"\"" + cmd + "\"\"",
            WorkingDirectory = dir,
            UseShellExecute = false, // inherit this console so logs stream through
        };

        try
        {
            using (Process p = Process.Start(psi))
            {
                p.WaitForExit();
                return p.ExitCode;
            }
        }
        catch (Exception e)
        {
            Console.Error.WriteLine("Failed to start host: " + e.Message);
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
            return 1;
        }
    }
}
