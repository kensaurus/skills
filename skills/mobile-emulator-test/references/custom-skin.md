# 0.5c. Minimal custom skin folder (generic pattern for any app)

Problem: pointing `skin.path` at a stock skin like `WXGA720` can force the guest
framebuffer to **`720×1280`** even when `config.ini` declares `hw.lcd.*`;
`adb shell wm size` will disagree with what you configured.

Mitigation:

1. Create e.g.
 **`%USERPROFILE%\.android\avd\<YourAvdFolder>\emulator_skin_1080x4000/`**
 (name is arbitrary; keep it alphanumeric + underscores).
2. Copy **all PNG + `hardware.ini`** from any stock SDK skin (for example
 `platforms/android-*/skins/WXGA720/`) so background assets exist — the emulator
 parser expects referenced files.
3. Replace **`layout`** in that folder with a definition whose `device.display`
 block matches **1080×4000** and whose **portrait** canvas includes small
 margins (≈ 27 px gutters mirror stock skins):

```txt
parts {
 portrait {
 background { image background_port.png }
 }
 landscape {
 background { image background_land.png }
 }

 device {
 display {
 width 1080
 height 4000
 x 0
 y 0
 }
 }
}

layouts {
 portrait {
 width 1134 # 1080 + 27*2 gutters
 height 4054 # 4000 + 27*2 gutters
 color 0xe0e0e0
 event EV_SW:0:1
 part1 { name portrait; x 0; y 0 }
 part2 { name landscape; x 4000; y 0 } # parked off-screen; adjust if emulator complains
 part3 { name device; x 27; y 27 }
 }

 landscape {
 width 4055 # swapped-ish canvas — tune if rotating AVD heavily
 height 1175
 color 0xe0e0e0
 event EV_SW:0:0
 dpad-rotation 3
 part1 { name portrait; x 4000; y 0 }
 part2 { name landscape; x 0; y 0 }
 part3 {
 name device
 x 26
 y 26
 rotation 3
 }
 }
}

keyboard { charmap qwerty2 }
network { speed full; delay none }
```

4. Update **`config.ini`**:

```
skin.dynamic=no
skin.name=emulator_skin_1080x4000
skin.path=C:\\Users\\<you>\\.android\\avd\\<YourAvdFolder>\\emulator_skin_1080x4000
```

Reboot the AVD after edits. Expect first boot warnings about **unable to resume
snapshot** after geometry/skin changes (`default_boot`) — cold boot once is OK.
