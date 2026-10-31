# Adding AI to Clearline: plan and low-cost test

## The one rule

**The AI never produces a number.** Every figure in a report comes from the models in `clearline/engine` and passes the
built-in checks (`clearline/engine/checks.py`). The AI reads, organises, explains and writes. Code checks everything it
produces, and the analyst approves it before it counts. A mistake by the AI can cost time, but it can never put a wrong
number in front of a client.

## The four jobs

| # | Job | What the AI gets | What it gives back | What code checks before anyone sees it |
|---|-----|------------------|--------------------|----------------------------------------|
| 1 | **Understand messy files** | Column headers, sheet names and about 20 sample rows (names masked) | Which kind of file it is, which column is which, the header row, day/month order, units ("in thousands") | Mapping must pass `intake.mapping_problems` and the file's health score must not get worse. If the AI and the rules disagree, the analyst decides |
| 2 | **Review the results** | Each section's result and its checks, the client's question | Review notes: claims the numbers don't support, missing caveats, two sections that contradict each other, sections worth adding or dropping | Each note must point to a real section and figure. Notes are suggestions the analyst accepts or dismisses |
| 3 | **Write the summary and notes** | The results the analyst put in the report | A draft summary and a short note per section, in English and Arabic | `checks.unbacked_numbers` rejects any draft with a figure the results don't contain. The analyst edits and approves |
| 4 | **Polish the Word and Excel files** | The finished report text | Wording fixes: plain language, consistent terms and tense, typos, Arabic quality, section titles | The AI never edits the file itself. It returns text changes as data, code applies the accepted ones, and the template does the layout. The number checker runs again after every change |

The professional look comes from the document template (`reports.py`): fonts, cover page, chart style and table
layout. That code is deterministic, so it looks the same every time. The AI only improves the words in it.

## How a report flows

```
Upload ─► rules map columns ──(unsure?)──► AI suggests ─► analyst confirms
       ─► models run ─► built-in checks
       ─► AI review notes ─► analyst picks sections
       ─► AI drafts summary/notes ─► number checker ─► analyst edits
       ─► AI wording pass ─► number checker ─► reviewer approves ─► Word / Excel
```

## Keeping client data safe

- Use the Claude API with a company API key, not the consumer chat app. API inputs aren't used to train models by
  default.
- Before sending any real client file, ask Anthropic for **zero data retention** on the account and get it in writing.
  The plan in `ai.py` already assumes this.
- Send the least data possible:
  - Job 1 sends headers and a few masked sample rows, never the whole file.
  - Jobs 2–4 send results, which are aggregates, not raw rows.
- Every AI call goes into the hash-chained activity log: who ran it, which job and how many tokens. The prompt itself
  is not logged.
- One switch in `config.AI_ENABLED`. With it off, the app works exactly as it does today.

## Which model

Default to **Claude Opus 5.5** (the most capable current model). Then let the test decide whether a cheaper one is good
enough for each job:

| Model | Input per 1M tokens | Output per 1M tokens | Likely fit |
|-------|--------------------:|---------------------:|------------|
| Claude Opus 5.5 (`claude-opus-5-5`) | $4.00 | $20.00 | Review (job 2); the safest default for everything |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`) | $2.00 | $10.00 | Writing and polish (jobs 3–4) if it scores as well |
| Claude Haiku 5.5 (`claude-haiku-5-5`) | $0.10 | $0.50 | Column mapping (job 1) if it scores as well |

Two discounts apply on top:
- **Batch API: half price.** Use it for the test runs, where nobody is waiting for the answer.
- **Prompt caching:** the fixed instructions are paid in full once, then read from cache at about a tenth of the
  price.

## Test first, at the lowest cost

### Step 0: build the test set (free)

The stress generator already makes messy client files and knows the right answers. Nothing real is sent in this step.

- **Job 1:** 200 messy files from `tests/stress/gen.py`. The generator records which column is which, so mapping
  accuracy is scored automatically.
- **Job 2:** 60 reports with planted problems: a summary that overclaims, a forecast presented without its error, two
  sections that contradict each other, a failed check left unexplained. The score is how many planted problems the AI
  finds, and how many false alarms it raises.
- **Jobs 3–4:** 60 reports. Automatic scores:
  - figures the results don't back (must be zero);
  - length;
  - Arabic present.

  Then you read 10 by hand and give each a 1–5 score.

### Step 1: dry run with no AI ($0)

Run the scorer against the rules alone. This is the baseline the AI has to beat.

### Step 2: the paid test (about $10–30 in total)

Run each job on all three models through the Batch API:

| Job | Cases | Rough cost per case on Opus / Sonnet / Haiku | Whole test, all three models, batch price |
|-----|------:|----------------------------------------------|------------------------------------------:|
| 1 Mapping | 200 | ~$0.03 / ~$0.015 / ~$0.001 | ~$5 |
| 2 Review | 60 | ~$0.25 / ~$0.12 / ~$0.01 | ~$12 |
| 3 Summary | 60 | ~$0.15 / ~$0.08 / ~$0.005 | ~$7 |
| 4 Polish | 60 | ~$0.10 / ~$0.05 / ~$0.003 | ~$5 |

These are estimates: thinking tokens change from case to case. The harness records the real token counts, so after
the first 10 cases you know the true price. Put a **monthly spend limit** of about $30 on the API account so the test
can't run over.

### Step 3: pick a model per job

Use the cheapest model that clears the bar:

| Job | Bar |
|-----|-----|
| 1 Mapping | ≥ 99% of required columns right, never worse than the rules alone |
| 2 Review | finds ≥ 90% of planted problems, ≤ 1 false alarm per report |
| 3 Summary | 0 unbacked figures, average hand score ≥ 4 / 5 |
| 4 Polish | 0 changed figures, hand score better than the unpolished text |

If no model clears a bar, that job stays manual.

### Step 4: shadow mode on real work (2–4 weeks, a few dollars)

Turn the AI on in the app with suggestions only: analysts see them but write their own reports as usual. The app
records how often analysts accept each suggestion. Switch a job fully on only when its acceptance rate is high.

**What one report would cost in real use:** about $0.30–$1.00 with Opus on every job, and less where a cheaper model
passes the test.

## What gets built, in order

1. `ai.py`:
   - the client, prompts with cached instructions, structured JSON outputs, token logging, the spend switch.
2. `tests/ai_eval/`:
   - the test sets from Step 0;
   - the scorer;
   - a batch runner that writes a cost and score table.
3. Job 1 in the column check screen: an **Ask AI** button when the rules are unsure.
4. Jobs 2 and 3 on the report page:
   - **Review with AI** (the notes);
   - **Draft with AI** (the slot already shown as "Off").
5. Job 4 as a **Polish wording** pass before export, with each change shown for accept or reject.

## What's needed to start

- An Anthropic API account (console.anthropic.com) with a small prepaid credit and a spend limit. This is separate
  from a Claude chat subscription.
- To let Claude run the test from a cloud session, store the key as a secret in the environment settings, not in
  chat. The app will read it from `ANTHROPIC_API_KEY`. On the office PC, the same variable goes in `start.bat`'s
  environment.
