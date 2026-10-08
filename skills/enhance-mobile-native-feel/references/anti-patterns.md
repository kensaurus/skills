# Anti-patterns — the web-shaped smells this pass removes

Name each one found in Phase 0 and the step that removes it. Naming the specific
pattern beats a general "make it feel native" instruction.

| Smell | Why it reads as web | Removed in |
|---|---|---|
| Header + footer drawn with `View`/`div`, `position: absolute`, opaque background | Browser chrome metaphor; ignores Liquid Glass and scroll-edge effects on iOS 26+ | Chrome |
| Custom JS tab bar with 6+ items or text-only labels | HIG caps at 5; symbols carry recognition in bars | Chrome |
| `StatusBar.setBackgroundColor` / `overlaysWebView: false` hacks | No-ops on Android 16; content ends up under bars | Chrome |
| One `ScrollView` per section, 1,000+ px tall | Page metaphor; no virtualization; no section rhythm | IA, Lists |
| "Load more" button, pagination numbers | Web pagination; mobile expects `onEndReached` | Lists |
| Home with 10+ cards, three CTAs above the fold | Cognitive load; nothing answers one question | IA |
| Full-page detour for a two-field task (filter, sort, confirm) | Sheets keep context; pages lose it | IA |
| `TouchableOpacity` with default opacity, or `<button>` with hover-only styling | No press response on touch; hover never fires | Motion |
| JS-thread `Animated` for layout or scroll-linked motion | Frame drops under load; the "web view" feel | Motion |
| Four easings and five durations across screens | No motion vocabulary; feels assembled | Motion |
| Haptic on every tap, or `Vibration.vibrate(50)` | Meaningless feedback; HIG says consistent meaning, used sparingly | Haptics |
| No haptic on success/error, no setting to disable | Missing feedback where it matters; no user control | Haptics |
| 12–14px body text, `allowFontScaling={false}`, three font families | Desktop density; breaks Dynamic Type | Type |
| Mixed icon fonts (FontAwesome + Ionicons + PNGs) | Inconsistent weights and optical sizes | Icons |
| Five or more accent colors, gradients as backgrounds | No hierarchy; bars cannot stay legible over it | Color |
| Liquid Glass or blur applied to content cards | HIG: glass belongs to the navigation layer only | Color |
| Hard dividers under every bar and between every row | Scroll-edge effects and spacing replace rules | Chrome, Type |
| Desktop breakpoints as the only responsive logic (`md:` for phone layout) | Phone layout is the default, not a breakpoint; see `enhance-capacitor-ui` | IA |

## What is **not** a smell

- A `FlatList` under ~300 simple rows.
- A JS tab bar on Android when the design system intentionally diverges from Material and
  the iOS build uses the system bar.
- A single hero animation built with Skia or a shader, when the rest of the app shares one
  spring vocabulary.
