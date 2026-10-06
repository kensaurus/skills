# Plain language for docs, captions, and listings (ASD-STE100 spirit)

ASD-STE100 Simplified Technical English (Issue 9, January 2025) is a controlled
language: 53 writing rules and a dictionary of about 900 approved words, each
with one meaning and one part of speech. Full conformance needs the licensed
dictionary. This file takes the rules that transfer to developer docs, README
copy, captions, alt text, and package descriptions, and adds the AI-tell list and
a prose-lint recipe.

## Contents

- Rules that transfer
- AI tells to remove
- Captions, alt text, descriptions
- Prose lint (Vale)
- Sources


## Rules that transfer

| Rule | Apply as |
|---|---|
| Max 20 words in a procedure sentence, 25 in descriptive text | Split long sentences. One idea each. |
| One instruction per sentence | "Run the gate. Then push." not "Run the gate and then push once it passes." |
| Active voice | "The playbook opens the PR." not "The PR is opened." |
| One word, one meaning | Pick one term per concept (skill, not skill / playbook / recipe in turn) and keep it. |
| Approved verb forms only: infinitive, imperative, simple past, past participle as adjective | Avoid "-ing" verb chains ("is running", "by configuring"); use nouns or imperatives. |
| Keep articles and the subject | "Run the test." not "Run test." |
| Start a warning with the condition or the command | "Before you push, run the gate." |
| No figures of speech, idioms, or metaphors | Say the thing. "not a vibe check" is a tell; "with a file and line" is the fact. |
| Prefer the short everyday word | use, not utilize; start, not initiate; show, not surface. |
| Vertical lists for steps and options | Three or more parallel items become a list, each item a full clause. |

Descriptive text keeps the 25-word cap. A README caption or an `alt` text is
descriptive text: it states what the image shows and what the reader does next.

## AI tells to remove

Writing produced by language models shares a fingerprint. Remove these before
shipping; a Vale rule can flag them.

- Em dashes used as a rhythm device, three per paragraph.
- Triplets by reflex ("fast, reliable, and secure").
- "Not X, but Y" and "It's not just X; it's Y" framings.
- Hedge openers: "In today's fast-paced world", "Whether you're a ... or a ...".
- Inflated verbs: delve, leverage, unlock, elevate, empower, streamline, seamlessly.
- Closing flourish: "Let's dive in", "Happy coding", "The possibilities are endless".
- Numbered "01 / 02 / 03" section labels and pill-shaped badges in UI copy.
- Claims with no number and no source ("blazing fast", "industry standard").

Replace each with a fact, a number, or nothing.

## Captions, alt text, descriptions

- **Alt text** describes the image for someone who cannot see it. Name the
  subject, the steps shown, and the result. No "image of".
- **Caption** says what the reader does with it. "After install, say the job in
  chat. The matching playbook runs."
- **Package description** (npm, marketplace) leads with the brand line and the
  inventory, then one sentence of behavior, then the stack. Search engines index
  the description and keywords; keep the terms people type ("agent skills",
  "Claude Code", "Cursor") in the first 160 characters.
- **Keywords** are the terms people search, one concept each, kebab-case. Ten to
  twenty-five. No marketing words.

## Prose lint (Vale)

Vale lints prose like ESLint lints code, with published styles from Microsoft,
Google, and `write-good`, and a YAML rule format for house terms. GitLab, GOV.UK,
and Epic Games run it in CI.

```ini
# .vale.ini
StylesPath = .vale/styles
MinAlertLevel = suggestion
Packages = Microsoft, write-good

[*.md]
BasedOnStyles = Vale, Microsoft, write-good, House
```

```yaml
# .vale/styles/House/AITells.yml
extends: existence
message: "AI tell: '%s'. Replace with a fact or remove."
level: warning
ignorecase: true
tokens:
  - delve
  - leverage
  - unlock
  - elevate
  - empower
  - streamline
  - seamless(?:ly)?
  - "it's not just"
  - "in today's"
  - "whether you're"
  - "let's dive in"
```

```yaml
# .vale/styles/House/SentenceLength.yml
extends: occurrence
message: "Sentence has more than 25 words."
level: warning
scope: sentence
max: 25
token: '\b(\w+)\b'
```

Run `vale sync` once, then `vale README.md docs/`. The Microsoft style already
flags passive voice, wordiness, and "click" as a UI verb.

## Sources

- ASD-STE100 Issue 9 (asd-ste100.org), rules 1.1 to 1.3, 5.2, 6 (sentence length)
- techwriter.ai, "Simplified Technical English (ASD-STE100)", 2026
- Vale documentation and package explorer (vale.sh), 2026
- Anthropic, "Prompting Claude Opus 5.5", frontend design defaults (name the specific pattern to avoid)
