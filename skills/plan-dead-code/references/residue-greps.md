# Residue grep pack

What Knip cannot see: junk *inside* live files, plus assets, env, and
duplication. `plan-dead-code` records the counts; `housekeep-dead-code`
applies the fix column. Adjust `src` to the detected source directory.

## Contents

- Dumping grounds
- Orphan assets
- Env drift
- The seven surfaces (3a–3g)

**Counting convention.** Use `rg -o … | wc -l` for a repo total of *matches*.
`rg -c` prints per-file counts of matching *lines*, so two `console.log` calls
on one line count once — fine for triage, wrong for a ratchet. Pick one and
keep it: the baseline and the post-cleanup number must be produced by the same
command or the ratchet compares nothing.

| Class | Count command | Fix (housekeep only) |
|---|---|---|
| Debug logging | `rg -o "console\.(log\|debug\|info)\(" src --glob '!**/*.{test,spec}.*' \| wc -l` | Delete, or route through the project's existing logger. **Never add a logger to satisfy this pass.** `console.error/warn` in catch blocks stay. |
| `debugger` | `rg -n "^\s*debugger;?\s*$" src` | Delete |
| Focused tests | `rg -n "\b(it\|test\|describe)\.only\(" src tests e2e 2>/dev/null` | Remove the **modifier**. `.only` silently disables the rest of its file, so the suite may go red — that is a bug it was hiding |
| Skipped tests | `rg -n "\b(it\|test\|describe)\.(skip\|todo)\(\|\bx(it\|describe)\(" src tests e2e 2>/dev/null` | Do not delete the test → un-skip and fix, or register rows in `housekeep-backlog` |
| Commented-out code | `rg -n "^\s*//\s*(const\|let\|var\|import\|export\|return\|if \(\|for \(\|await \|function\|\}\|<[A-Za-z])" src` | Delete the block. Git is the archive; "keep for reference" is not a reason |
| Placeholders | `rg -n -i "your logic here\|implement me\|lorem ipsum\|placeholder text\|TODO: implement" src` | Wire or delete. If the control is user-visible → `plan-stub-checker` |
| TODO / FIXME / HACK | `rg -o "TODO\|FIXME\|HACK\|XXX" src \| wc -l` | Count only → `housekeep-backlog` |
| Orphan versions | `rg --files src \| rg -i "(v2\|v3\|new\|old\|copy\|backup\|final\|tmp)\.(tsx?\|css)$"` | Confirm which one the router/imports actually use; delete the rest. The survivor keeps its original name |
| Dumping grounds | see script below | >15 exports: split by domain, or inline single-caller helpers |
| `@ts-ignore` / `@ts-expect-error` | `rg -o "@ts-ignore\|@ts-expect-error" src \| wc -l` | Fix the type, or convert to `@ts-expect-error <reason>` — it self-expires, and TS reports it once the error is gone |
| `eslint-disable` | `rg -o "eslint-disable\|biome-ignore" src \| wc -l` | Per-line with a reason, or fix. File-level disables are removed and the file fixed |
| `any` | `rg -o ":\s*any\b\|as any\b\|<any>" src \| wc -l` | Ratchet metric. Fix only where it hides a real bug this pass. **Never widen a type to remove a suppression** |
| Empty catch | `rg -n -U "catch\s*(\([^)]*\))?\s*\{\s*\}" src` | Log + rethrow, or one line saying why swallowing is correct |
| Orphan assets | see script below | Delete. Confirm no reference from CSS, `index.html`, or storage seeds first |
| Env drift | see script below | Add missing keys to `.env.example`; remove declared-but-unreferenced. **Names only — never print values** |
| Duplication | `npx jscpd src --min-tokens 50 --min-lines 5 --reporters console` | Behavior-preserving → `workflow-refactor`, never bundled with a deletion commit |
| Bundle leak | `npm run build && rg -l "service_role\|SUPABASE_SERVICE_ROLE" dist` | **Any hit stops the pass** → `plan-secrets-audit` immediately |

The bundle-leak row is not dead-code hygiene — it is the one check here that
can find a live credential in shipped output. Run it even if the rest of
Phase 3 is skipped.

## Dumping grounds

An AI-written `lib/utils.ts` accretes helpers nobody deletes. Rank by export
count so the barrel itself becomes the finding:

```bash
for f in $(rg --files src | rg "(utils|helpers)/.*\.tsx?$|lib/utils\.tsx?$"); do
  echo "$(rg -c '^export ' "$f" 2>/dev/null || echo 0) $f"
done | sort -rn
```

If one file explains twenty unused-export findings, that is **one M-effort
fix**, not twenty S-effort ones. Report the barrel.

## Orphan assets

```bash
for f in $(find public -type f ! -name "*.md" 2>/dev/null); do
  b=$(basename "$f")
  rg -q --fixed-strings "$b" src index.html 2>/dev/null || echo "orphan: $f ($(du -h "$f" | cut -f1))"
done
```

Repeat for `src/assets` against `src`. Because the loop searches `src`, fonts
referenced only from a CSS `@font-face` count as used.

**Known false positive:** hashed or templated references
(`` `/img/${slug}.png` ``, Vite's `new URL('./x.png', import.meta.url)`) never
match a basename scan. A directory reached only by template string is
`needs-owner`, not dead.

## Env drift

Both directions matter: referenced-but-undeclared breaks production;
declared-but-unreferenced is dead config.

```bash
rg -o "import\.meta\.env\.[A-Z0-9_]+" src | sed 's/.*env\.//' | sort -u  > /tmp/env-used
rg -o "process\.env\.[A-Z0-9_]+"      src | sed 's/.*env\.//' | sort -u >> /tmp/env-used
sort -u -o /tmp/env-used /tmp/env-used
rg -o "^[A-Z0-9_]+" .env.example | sort -u > /tmp/env-declared

echo "referenced, not declared:"; comm -23 /tmp/env-used /tmp/env-declared
echo "declared, not referenced:"; comm -13 /tmp/env-used /tmp/env-declared
```

Any `VITE_` / `NEXT_PUBLIC_` key whose value is not meant for the browser is a
secrets finding, not an env-hygiene one → `plan-secrets-audit`.

## The seven surfaces (3a–3g)

The Phase 3 procedure as `plan-dead-code` runs it. Count each; fix nothing.

**3a. Unused variables and imports inside files.** Knip explicitly does
not do this. Baseline with `tsc --noEmit` under `noUnusedLocals` +
`noUnusedParameters`, or your linter's unused rule. Record the count and
whether the compiler flags are even on.

**3b. Copy-paste duplication.** The class AI-assisted repos are worst at,
and no other skill in this pack detects it. `npx jscpd src --min-tokens 50
--reporters json` (50 is the default; raising it cuts boilerplate noise).
Record duplication % and the top clone pairs. **Duplication is a refactor
finding, not a deletion finding** — route to `workflow-refactor`.

**3c. Debug residue.** Mechanical and countable:

```
rg -n "console\.(log|debug|warn)|debugger" --glob '!*test*' --glob '!*spec*'
rg -n "\.(only|skip|todo)\(|xit\(|xdescribe\(|fdescribe\("
```

Plus commented-out code blocks and `utils`/`helpers` dumping grounds.
`.only` in a committed test is worse than dead code — it silently disables
the rest of the file. Flag those **high**.

**3d. Suppression debt.** The count that must only ever shrink. Use
`rg -o … | wc -l` for a repo total — `rg -c` prints per-file counts of
*matching lines*, which is not a number you can ratchet:

```
rg -o "@ts-ignore|@ts-expect-error|eslint-disable|biome-ignore" | wc -l
rg -o ":\s*any\b|as any\b" | wc -l
```

Also catch stale suppressions: a `@ts-expect-error` on a line that no
longer errors is itself dead code, and TypeScript reports it.

**3e. Orphan assets.** Knip reads the module graph, so it cannot see
binaries. Cross-reference every filename under `public/`, `assets/`,
`static/` against source, CSS, and HTML. Beware hashed and templated
references (`` `/img/${name}.png` ``) — those make a name-based scan
report false orphans, so a folder referenced only by template string is
`needs-owner`, not dead.

**3f. Env var drift, both directions.** Referenced-but-undeclared is a
production break; declared-but-unreferenced is dead config:

```
rg -o "import\.meta\.env\.[A-Z0-9_]+|process\.env\.[A-Z0-9_]+" -r '$0' --no-filename | sort -u
```

Diff that set against `.env.example`. Report names only — **never print
values.**

**3g. Dead database schema.**  [read-only this pass]

These three commands only read, so they are safe against any target
including production — and index-scan statistics are *only* meaningful
against real traffic, so prefer production and record the stats window.
The non-production gate applies to anything that writes.

```
supabase db lint                            # plpgsql_check: dead code after RETURN, unused variables
supabase inspect db unused-indexes          # indexes with low scan counts
supabase inspect db seq-scans
```

Then cross-reference client usage to find orphans the database cannot know
about: `rg -o "\.from\('[^']+'\)|\.rpc\('[^']+'\)|functions\.invoke\('[^']+'\)"`
against the table/function/Edge-Function inventory. Also: Edge Functions
deployed but never invoked, migration sprawl, and whether generated types
still match the schema (`supabase gen types` diff).

**Low index scans on a young or read-light database is not evidence of a
dead index.** Record the stats window. Every schema finding lands in the
plan as a proposal — **no `DROP` is authored in this pass**, and destructive
migrations route to `plan-data-integrity` and `db-migrator`.
