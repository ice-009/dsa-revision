---
name: review-my-code
description: Review the user's own DSA solutions written in the DSA Revise app ("Your code"). Pulls their code from the private data repo, adds explanatory comments, translates it to C++/Java/JavaScript, tests every version against the problem's test cases, explains their approach (and how it differs from the reference if it does), then pushes the review back so the app shows it. Use when the user runs /review-my-code, or asks to review / comment / translate the code they wrote in the app.
argument-hint: "[problem numbers…] [--all]"
---

# Review my code

The user writes solutions on the problem pages of DSA Revise. The app syncs them to the private GitHub repo
`ice-009/dsa-revise-data` (`code.json`). This skill turns each new or changed solution into a review in
`reviews.json`, which the app downloads and shows under **Your code**.

All plumbing goes through `scripts/mycode.py` (run from the repo root). Local working files live in `.mycode/` (gitignored).

## 1. Pull and pick what to review

```bash
python3 scripts/mycode.py pull
```

It lists every solution whose code changed since its last review. If the user passed problem numbers
(`$ARGUMENTS`), review only those (`python3 scripts/mycode.py pending 5 42` shows them even if already reviewed);
`--all` redoes every solution. If nothing is pending, say so and stop.

## 2. For each problem N

```bash
python3 scripts/mycode.py show N
```

This prints the problem, the app's reference approach and code in all three languages (use them for exact
class / method names and signatures — the test harness calls those), the test entry point, and **their code**
(also saved as `.mycode/work/N/mine.<ext>`).

Read their code carefully and decide:

- **Is it correct?** Trace it on the example and on edge cases (empty input, one element, duplicates, negatives…).
- **Is it the same approach as the reference** (same core idea and complexity), or a different one (e.g. sorting
  instead of a hash set, recursion + memo instead of bottom-up DP, brute force instead of two pointers)?
  Style differences, different variable names, or iterative-vs-recursive of the same idea count as the **same** approach.

Then write four files into `.mycode/work/N/`:

### `sol.<their language>` — their code, commented
Their code **exactly as written** — same logic, same names, same structure, same formatting — with comments added.
Never rewrite, rename or "improve" their code here; this file is theirs.
- One short comment above each meaningful step saying *why*, not just *what* (`// the window must not contain s[r] twice, so jump past its last position`).
- A 1–2 line comment at the top naming the approach and its complexity.
- If it lacks the LeetCode wrapper the harness needs (e.g. no `class Solution`), add only the wrapper.
- If there's a bug, keep the buggy line and put a `// BUG: …` comment on it explaining what goes wrong and the fix.

### `sol.<the other two languages>` — translations of *their* approach
Translate **their** approach (not the reference's) into the other two of `cpp`, `java`, `js`, with the same comments.
Follow the app's style: plain step-by-step code, clear names, braces everywhere, one action per line, blank lines
between steps, no clever tricks (no destructuring, chained ternaries, streams, lambdas). Match the reference's
class / method names and signatures. JS has no built-in heap: if you need one, include the `Heap` class from
`solutions/js/_heap.js` at the top. If their code has a bug, the translations use the fixed version.

### `review.json`
```json
{
  "approach": {
    "name": "Hash set of seen values",
    "summary": "2–4 sentences in plain words: the idea behind THEIR solution and why it works.",
    "steps": ["Step 1 of their algorithm", "Step 2", "…"],
    "cx": "O(n) time / O(n) space"
  },
  "same": true,
  "compare": "",
  "notes": ["Short, specific review points"]
}
```
- `same`: `true` if it's the reference approach, `false` if it's a different one.
- `compare` (required when `same` is false, otherwise empty): 2–3 sentences on how their approach differs from the
  reference, the trade-off (time / space / simplicity), and when an interviewer would prefer each.
- `notes`: 0–4 concrete points — bugs, missed edge cases, complexity they could improve, or a cleaner way to write
  one part. Praise only when it's specific ("Checking before inserting avoids pairing an element with itself").
  Don't pad; an empty list is fine for clean code.
- Write for someone revising for interviews: plain English, no jargon without a reason.
- All text fields are shown as plain text in the app: no Markdown, no backticks, no bullet characters.

### Test every version
```bash
python3 scripts/mycode.py verify N
```
Runs all three files against the problem's test cases. Translations **must** pass — fix them and re-run until they
do. Their own commented file may fail only if their original code is buggy; then make sure a `notes` entry and a
`// BUG:` comment explain it. If their own file fails because of a missing wrapper or signature mismatch (not their
logic), fix the wrapper.

### Save
```bash
python3 scripts/mycode.py save N
```

## 3. Push and report

```bash
python3 scripts/mycode.py push
```

Then tell the user, per problem: the approach name, same / different from the reference, test results per
language, and any bugs found. Remind them the app picks the review up on its next sync (it syncs on launch and when
reopened, or More → **Sync now**).

## Rules
- Never edit `code.json` — the app owns it. This skill only writes `reviews.json`.
- Never change the app's own reference solutions, notes or explanations as part of a review.
- If the data repo can't be cloned, tell the user to check `gh auth status`.
