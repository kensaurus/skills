#!/usr/bin/env node
/**
 * Desktop notification for Claude Code's Notification hook.
 *
 * Claude Code pipes one JSON object on stdin: { session_id, cwd, message,
 * title, notification_type, ... } (https://code.claude.com/docs/en/hooks,
 * read 2026-10-19). This script turns it into an OS notification so you know
 * which session wants you when several run at once:
 *
 *   permission_prompt   a tool call has waited ~6 s for approval
 *   idle_prompt         Claude finished ~60 s ago and you have not typed
 *   agent_needs_input   a background session is waiting on you
 *   agent_completed     a background session finished or failed
 *
 * Linux uses notify-send, macOS uses osascript, Windows uses a WinRT toast
 * through PowerShell. No shell is involved: every argument is passed as an
 * array element. Notification hooks cannot block anything and their exit code
 * is ignored, so this script never throws and always exits 0.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const APP = "Claude Code";

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

const input = readStdin();
const type = String(input.notification_type ?? "");
const where = input.cwd ? basename(String(input.cwd)) : "";
const title = String(input.title ?? APP).trim() || APP;
const body = [String(input.message ?? "").trim(), where && `(${where})`]
  .filter(Boolean)
  .join(" ") || type || "needs your attention";

const urgent = type === "permission_prompt" || type === "agent_needs_input";

function run(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { stdio: "ignore", timeout: 4000, windowsHide: true });
    return r.status === 0;
  } catch {
    return false;
  }
}

if (process.platform === "linux") {
  run("notify-send", [
    `--app-name=${APP}`,
    `--urgency=${urgent ? "critical" : "normal"}`,
    "--expire-time=10000",
    title,
    body,
  ]);
} else if (process.platform === "darwin") {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  run("osascript", ["-e", `display notification "${esc(body)}" with title "${esc(title)}"`]);
} else if (process.platform === "win32") {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "''");
  const script = [
    "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null",
    "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null",
    `$xml = New-Object Windows.Data.Xml.Dom.XmlDocument`,
    `$xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${esc(title)}</text><text>${esc(body)}</text></binding></visual></toast>')`,
    `[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${esc(APP)}').Show([Windows.UI.Notifications.ToastNotification]::new($xml))`,
  ].join("; ");
  run("powershell", ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", script]);
}

process.exit(0);
