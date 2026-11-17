# Launch kit

Facts, rules, and an order of work for announcing the pack. Researched 2026-11-17; sources are at the end. Listing status lives in [DISTRIBUTION.md](DISTRIBUTION.md) and [PROMOTION.md](PROMOTION.md).

**Write every post yourself.** Hacker News requires launch text to be written by a person, not generated or edited by a model, and several subreddits remove AI-written posts. This page gives you verified facts and an outline. It does not give you copy to paste.

## Where the pack stands

| Measure | Value | Source |
|:--------|:------|:-------|
| skills.sh installs | 3.7K | skills.sh page, 2026-11-17 |
| GitHub stars | 9 | `gh api`, 2026-11-17 |
| Repo views, 14 days | 252 from 156 visitors | GitHub traffic API, 2026-11-17 |
| Repo clones, 14 days | 8,241 from 1,560 cloners | GitHub traffic API, 2026-11-17 |
| Top referrers | Google 9, aocr.org 8, github.com 5, doubao.com 3 | GitHub traffic API, 2026-11-17 |

People install the pack without ever seeing the repo page. That explains 9 stars against 3.7K installs, and it means a launch has to bring readers to the README, not only to an install command.

## What to lead with

Lead with one mechanism, not the size of the pack.

- Posts titled by size failed on Hacker News: "198 modular skills" and "42 Claude Code skills" got 3 points each.
- Posts about one concrete mechanism did well: a hook that quizzes you on your AI's code got 253 points; skills that build complete Godot games got 337.

The pack's mechanism is the **completion gate**: a Stop hook and a judge subagent that refuse "done" while checklist items are still open. Second choice: `/kenji`, one command that picks the playbook from a plain sentence.

## Objections to answer before they are asked

These five came up most in comparable threads. Each has a true answer in the repo.

| Objection | The answer, with where it is proven |
|:----------|:------------------------------------|
| Current models do not need this. | The gate exists because text alone does not stop an early finish; newer models end turns early more often at low and medium effort ([MODEL-AND-EFFORT.md](MODEL-AND-EFFORT.md)). |
| It burns tokens and adds ceremony. | `--profile core` installs 31 skills with a listing of about 7,200 characters against about 39,000 for the full pack. `/kenji` and `/handoff` cost nothing until used. |
| Every developer has a personal skills suite; this is one AGENTS.md. | A skill's body loads only when it runs; an AGENTS.md loads every session. The installer is a merge and never deletes your own skills. |
| There is no proof it changes output. | True today. `evals/` holds twelve routing cases; only one has been run. Say so, and publish numbers when you have them. |
| Trust: instructions you did not write, telemetry. | The installer has no dependencies, opens no network connection, and starts no child processes. `--dry-run` lists every file first; `--verify` hash-checks each copy. |

Do not claim a benchmark you have not run. The strongest follow-up post is a measured one: run the trigger evals with and without the plugin and report the difference.

## Channels, in order of evidence

| # | Channel | Rule to respect | Format | Evidence for comparable tools |
|--:|:--------|:----------------|:-------|:------------------------------|
| 1 | Hacker News, Show HN | Must be something people can try. Text written by you. No asking for upvotes or comments. | Show HN, with the backstory as your first comment | 138 AI repos averaged 121 stars in 24 hours; 62% of Show HNs get no replies |
| 2 | X, Japanese developer community | None | A Japanese post with a short demo video | One solo Japanese skill reached about 760 stars in a day |
| 3 | Zenn | No promotion gate found | A 「作りました」 article that explains how the gate works | Skill-build articles at 180 to 718 likes |
| 4 | Qiita | Not mainly for promotion; a technical explanation of your own tool is allowed | Article | A skills guide at 412 likes; an author-released skill at 140 |
| 5 | r/ClaudeCode (436K) | Flair required; simple project sharing goes in the weekly showcase thread | A detailed post | Skills posts at 97 and 73 points |
| 6 | r/claudeskills (74K) | Read the sidebar first | "Skill Share" or "Showcase" flair | Posts at 263, 177, 138 points in November 2026 |
| 7 | r/ClaudeAI (1.17M) | Built with or for Claude, free to try, little promotion language, karma over 100, flair | A post on how Claude helped build it | A size-led pack post scored 0 |
| 8 | Console.dev, Changelog News | Console: email. Changelog: signed-in form, no tutorials | A short pitch | None found |

Reddit blocked direct reads during the research, so check each live sidebar before posting.

**Skip:** Product Hunt (no star or install data for open-source tools), dev.to (one write-up saw no GitHub visitors from 355 views), Lobsters (invite-only, no self-promotion in the first 70 days), r/cursor and r/opensource (skills posts scored 1), daily.dev (needs 250 reputation).

## A two-week order

1. **Prepare.** Write the copy yourself. Record a 60 to 90 second video of the gate refusing "done". Comment normally on Hacker News and Reddit so the accounts are not cold.
2. **Japanese first.** A Zenn article and a Japanese X post on a weekday morning, Japan time. No gate, the strongest comparable result, and it tests the framing.
3. **Show HN** two days later, at a time you can answer comments for three hours.
4. **Reddit**, one subreddit per day, each with a different angle: r/ClaudeCode, then r/claudeskills, then r/ClaudeAI.
5. **Quiet channels**: the Console.dev email and the Changelog form.
6. **Qiita** the following week, on how the gate works, with an English X thread and the video.
7. **Second attempt.** If the Show HN got no attention, email hn@ycombinator.com to ask for the second-chance pool, or post a measured write-up as a regular submission.

About 10 to 20 stars in one day is plausibly enough for GitHub's JavaScript trending page, and 10 stars opens two awesome lists that gate on it.

## One-click install links

| Host | Link or command |
|:-----|:----------------|
| VS Code (Copilot) | `vscode://chat-plugin/add-marketplace?ref=kensaurus%2Fskills` |
| Claude Code | `/plugin marketplace add kensaurus/skills` then `/plugin install kenji@kenji` |
| Any agent | `npx @kensaurus/skills --auto` |

## Sources

- Show HN rules: https://news.ycombinator.com/showhn.html and https://news.ycombinator.com/newsguidelines.html
- Stars after Show HN (138 AI repos): https://arxiv.org/abs/2511.04453
- Show HN reply rates and timing: https://syften.com/blog/best-time-to-post-on-hacker-news/
- Hacker News thread scores: hn.algolia.com, items 47400868, 50137950, 48739459, 50147492
- Reddit rules and sizes (snapshots, August to October 2026): https://prowlo.com/tools/subreddit-stats/claudecode, https://prowlo.com/tools/subreddit-stats/claudeai
- Zenn and Qiita examples: https://zenn.dev/algoartis/articles/0b1c731881b25c, https://qiita.com/yamamoto0/items/17817dc09a78078fa132
- Qiita community guideline: https://help.qiita.com/ja/articles/qiita-community-guideline
- Console.dev criteria: https://console.dev/selection-criteria; Changelog: https://changelog.com/news/submit
- Vercel, state of agent skills (2026-09-25): https://vercel.com/blog/state-of-agent-skills
- VS Code and Copilot plugin marketplace: https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md
