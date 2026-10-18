using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class FadeLauncher
{
    [STAThread]
    private static int Main(string[] args)
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string script = Path.Combine(root, "launcher.ps1");
        // Validate packaging without starting or touching a running Codex session.
        if (args.Length == 1 && args[0] == "--check")
            return File.Exists(script) ? 0 : 1;
        try
        {
            if (!File.Exists(script)) throw new FileNotFoundException("Missing launcher.ps1", script);
            var info = new ProcessStartInfo
            {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), @"WindowsPowerShell\v1.0\powershell.exe"),
                Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + script + "\"",
                WorkingDirectory = root,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            using (var process = Process.Start(info))
            {
                process.WaitForExit();
                if (process.ExitCode != 0)
                    throw new InvalidOperationException("Fade Codex 启动失败。请查看：\n" + Path.Combine(root, "launch.log"));
            }
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "Fade Codex", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
