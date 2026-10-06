@echo off
REM Windows cwd shim: `npx @kensaurus/skills` from this clone
REM ends up as `cmd /c kenji`, which looks in the current directory.
node "%~dp0bin\kenji.js" %*
