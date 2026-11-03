"""Guardrails for the any-data services: a guide on how to set each one up, help under every setting, and checks on
the chosen settings before anything runs.

A check returns flags: {'level', 'text', 'setting'}.
- stop: the settings can't answer a sensible question (an ID used as a group, a 'before' score explained by the
  'after' score). Run stays off until it is changed.
- warn: probably not what was meant. It runs, and the warning goes into the result's checks so the reviewer sees it.
- tip: a better way to answer the same question.
"""

from __future__ import annotations

import re

import numpy as np
import pandas as pd

from . import svc_general as g
from .core import Data, NeedsData

STOP, WARN, TIP = 'stop', 'warn', 'tip'
BEFORE = g.WORD_BEFORE
AFTER = g.WORD_AFTER
NOT_ADDITIVE = re.compile(r'(?i)score|grade|mark|rate|%|percent|age\b|minutes|time|temperature|weight|height|price|average|mean|rating|satisf|درجة|نسبة|عمر|متوسط')
PROCESS = re.compile(r'(?i)reading|measure|fill|thickness|diameter|length|temperature|pressure|volume|weight|\bml\b|\bmm\b|\bkg\b|minutes|time|defect|قياس')

# ---------- The guides ----------

GUIDES: dict[str, dict] = {
    'data-profile': {
        'question': 'What is in this table, and can it be trusted?',
        'steps': ['Nothing to choose: it reads every column.', 'Run it first on any new table, before any other service: it shows gaps, odd values and which columns are numbers, dates or categories.'],
        'avoid': ['Reporting it on its own: it describes the data, it doesn’t answer the client’s question.'],
    },
    'group-comparison': {
        'question': 'Do these groups really differ on this measure, or is it chance?',
        'steps': [
            'Measure: the result you care about, measured once per row (a score, a waiting time, a yes/no outcome).',
            'Group: the column that names who belongs where (school, clinic, programme group, machine). It needs a few values, each with at least 5 rows.',
        ],
        'example': 'Did the new teaching method raise scores? Measure “Score after”, group “Group”.',
        'avoid': [
            'An ID or name column as the group: every row would be its own group.',
            'A “before” score when an “after” score exists: that only shows whether the groups started equal.',
            'Reading a difference as a cause: other things may differ between the groups.',
        ],
    },
    'what-drives-an-outcome': {
        'question': 'Which factors are linked to this result, and by how much, once the others are allowed for?',
        'steps': [
            'Outcome: the result you want to explain. It should come last in time (an “after” score, repaid or not, passed or not).',
            'All other usable columns are tested as factors automatically, about one factor per ten rows.',
        ],
        'example': 'Who repays on time? Outcome “Repaid on time”.',
        'avoid': [
            'A “before” column as the outcome when an “after” column exists: that explains the past with the future.',
            'Columns recorded after the outcome (a “follow-up call made” column): they look like strong drivers but are consequences.',
            'Calling a link a cause: it shows links once other factors are allowed for, not proof.',
        ],
    },
    'trend-and-forecast-for-any-measure': {
        'question': 'Is this measure rising or falling over time, does it repeat by season, and what comes next?',
        'steps': [
            'Date: when each row happened.',
            'Measure: the number to follow over time, or leave it empty and add up by “Count of rows” to follow how many rows there are (visits, cases, orders).',
            'Add up by: “Total” for amounts and counts; “Average” for scores, times, rates and other values that don’t add up.',
        ],
        'example': 'Are clinic waits getting longer? Date “Visit date”, measure “Waiting minutes”, add up by “Average”.',
        'avoid': [
            'Less than a year of data for a yearly trend or a forecast to plan on.',
            '“Total” on scores, ages or percentages: adding them up means nothing.',
            'One date per person (a test date) when the question is about the people, not about time.',
        ],
    },
    'survey-and-questionnaire-analysis': {
        'question': 'How did people answer each question, are the questions reliable as a scale, and do groups answer differently?',
        'steps': [
            'Nothing is needed to start: rating questions (1–5, 0–10, agree/disagree, in English or Arabic) are found automatically.',
            'Compare answers by: optional, a group column such as school, village or “Took part”.',
        ],
        'example': 'Are parents satisfied, and does it differ by school? Compare answers by “School”.',
        'avoid': ['A group with many values (an ID, a free-text answer).', 'Treating an open online survey as representative of everyone.'],
    },
    'before-and-after-impact': {
        'question': 'Did a programme, training or change actually work, and by how much?',
        'steps': [
            'Measure before: the value before the change.',
            'The same measure after: the same thing, in the same units, after the change.',
            'Took part or not: the column marking who got the programme. With it, the effect is measured against the comparison group, so changes that hit everyone (season, prices) cancel out.',
        ],
        'example': 'Did the livelihoods programme raise income? Before “Monthly income before”, after “Monthly income after”, took part “Took part”.',
        'avoid': ['Leaving “Took part” empty when the file has a comparison group.', 'Swapping before and after.', 'Two different measures (income before, savings after).'],
    },
    'quality-and-process-control': {
        'question': 'Is this process stable, where did it change, and does it meet the specification?',
        'steps': [
            'Measurement: one number measured again and again on a process (fill volume, thickness, temperature, daily waiting time).',
            'Time order: the time of each measurement, unless the rows are already in time order.',
            'Sample or batch: if several items are measured together each time (5 bottles per sample).',
            'Specification limits: the allowed range, if there is one, to get capability (Cpk).',
        ],
        'example': 'Is the bottling line in control? Measurement “Fill ml”, sample “Sample”, limits 495 and 505.',
        'avoid': ['People’s scores, incomes or ages: they aren’t a process over time; use Group comparison.', 'Rows in random order with no time column: the run rules then mean nothing.'],
    },
    'natural-groups': {
        'question': 'Do the rows fall into natural groups, and what sets each group apart?',
        'steps': [
            'Number of groups: leave at 0 to let the data choose; set it only if the client needs a fixed number.',
            'Compare with: optional, a known label (school, region) to see whether the groups line up with it.',
            'All number columns are used; identifiers are left out automatically.',
        ],
        'example': 'Are there different kinds of students? Leave everything as it is, compare with “School”.',
        'avoid': ['Reporting groups with a separation under 0.25 as real types: they are tendencies.', 'Many groups on few rows.'],
    },
}

HELP: dict[str, dict[str, str]] = {
    'group-comparison': {'measure': 'The result to compare, once per row: a score, a time, a yes/no outcome.', 'group': 'Who belongs where: a column with a few values (school, clinic, programme group).'},
    'what-drives-an-outcome': {'outcome': 'What you want to explain. It should come last in time: an “after” score, passed, repaid.'},
    'trend-and-forecast-for-any-measure': {'date': 'When each row happened.', 'measure': 'The number to follow. Leave empty to count rows.', 'how': 'Total for amounts and counts; Average for scores, times and rates.'},
    'survey-and-questionnaire-analysis': {'group': 'Optional: compare answers between groups (school, village, took part).'},
    'before-and-after-impact': {'before': 'The value before the change.', 'after': 'The same measure, in the same units, after the change.', 'group': 'Who got the programme. With it, the effect is measured against those who didn’t.'},
    'quality-and-process-control': {'measure': 'One number measured again and again on a process.', 'order': 'The time of each measurement, if the rows aren’t already in time order.', 'sample': 'If several items are measured together each time.', 'lsl': 'The lowest allowed value, if there is a specification.', 'usl': 'The highest allowed value, if there is a specification.'},
    'natural-groups': {'k': '0 lets the data choose the number of groups.', 'label': 'Optional: a known label to compare the groups with.'},
}

QUESTION_HELP = 'The client’s question, in their words. It is printed above the result, so the reviewer can see the settings answer it.'

# ---------- Reading the table ----------


def _table(d: Data, p: dict, keys: list[str]) -> tuple[pd.DataFrame | None, dict[str, str | None]]:
    cols: dict[str, str | None] = {}
    file = None
    for k in keys:
        ref = p.get(k)
        if not ref:
            cols[k] = None
            continue
        try:
            name, col = g._resolve(d, ref)
        except NeedsData:
            cols[k] = None
            continue
        file = file or name
        cols[k] = col
    if file is None and d.files:
        file = max(d.files, key=lambda f: len(d.files[f]))
    return (d.files.get(file) if file else None), cols


def _later(col: str, df: pd.DataFrame) -> str | None:
    """The later column if this one is the earlier of a pair (by words or numbered rounds), else None."""
    later = g.is_earlier(col, df)
    if later:
        return later
    if BEFORE.search(col):
        afters = _others(df, AFTER, {'number', 'binary'})
        return afters[0] if afters else None
    return None


def _others(df: pd.DataFrame, rx: re.Pattern, kinds: set[str]) -> list[str]:
    return [str(c) for c in df.columns if rx.search(str(c)) and g.kind_of(str(c), df[c]) in kinds]


def _common(df: pd.DataFrame, cols: dict[str, str | None], labels: dict[str, str]) -> list[dict]:
    out = []
    seen: dict[str, str] = {}
    for k, col in cols.items():
        if not col:
            continue
        if col in seen:
            out.append(flag(STOP, f'“{col}” is chosen for both {labels[seen[col]]} and {labels[k]}. Choose a different column for each.', k))
        seen[col] = k
        s = df[col]
        if g._id_like(col, s) or (g.kind_of(col, s) == 'text' and k not in ('date', 'order')):
            out.append(flag(STOP, f'“{col}” looks like an identifier or free text (almost every row is different), not a {labels[k]}.', k))
        filled = s.notna().mean()
        if filled < 0.5:
            out.append(flag(WARN, f'“{col}” is only {filled:.0%} filled: the result rests on the rows that have it.', k))
    return out


def flag(level: str, text: str, setting: str | None = None) -> dict:
    return {'level': level, 'text': text, 'setting': setting}


# ---------- Checks per service ----------


def _group_checks(df, col, key, label) -> list[dict]:
    out = []
    if not col or g._id_like(col, df[col]) or g.kind_of(col, df[col]) == 'text':
        return out  # already stopped as an identifier
    v = df[col].dropna()
    n = v.nunique()
    if n > 30 or (len(v) >= 20 and n > 0.5 * len(v)):
        out.append(flag(STOP, f'“{col}” has {n:,} different values: that’s not a {label}. Choose a column with a few values, such as a school or a programme group.', key))
    elif n > 12:
        out.append(flag(WARN, f'“{col}” has {n} values: only the 12 largest are compared.', key))
    else:
        small = (v.astype(str).value_counts() < 5).sum()
        if small:
            out.append(flag(WARN, f'{small} value{"s" if small > 1 else ""} of “{col}” have fewer than 5 rows: too few to compare reliably.', key))
    return out


def check_compare(d, p, df, cols):
    m, grp = cols['measure'], cols['group']
    out = _group_checks(df, grp, 'group', 'group')
    later = _later(m, df) if m else None
    if later:
        out.append(flag(WARN, f'“{m}” is the earlier measurement. This only shows whether the groups started equal. For the result, compare “{later}”, or use Before-and-after impact.', 'measure'))
    if m and grp and (g.time_pairs(df) or (_others(df, BEFORE, {'number'}) and _others(df, AFTER, {'number'}))) and g._arm(d):
        out.append(flag(TIP, 'This table has before and after values and a group that took part: Before-and-after impact measures the effect more precisely than comparing the after values alone.'))
    if not m or not grp:
        out.append(flag(STOP, 'Choose the measure and the group.'))
    return out


def check_drivers(d, p, df, cols):
    o = cols['outcome']
    out = []
    if not o:
        return [flag(STOP, 'Choose the outcome to explain.', 'outcome')]
    later = _later(o, df)
    if later:
        out.append(flag(STOP, f'“{o}” comes before “{later}”. Using it as the outcome explains the past with the future. Choose “{later}”.', 'outcome'))
    n = int(df[o].notna().sum())
    if n < 50:
        out.append(flag(WARN, f'Only {n} rows with an outcome: few factors can be tested reliably, and the result is a rough guide.', 'outcome'))
    if g.kind_of(o, df[o]) == 'binary':
        share = df[o].dropna().astype(str).value_counts(normalize=True).min()
        if share < 0.05:
            out.append(flag(WARN, f'Only {share:.0%} of rows have the rarer outcome: too few cases to learn from.', 'outcome'))
    return out


def check_trend(d, p, df, cols):
    dt, m = cols['date'], cols['measure']
    how = p.get('how') or 'Total'
    out = []
    if not dt:
        return [flag(STOP, 'Choose the date column.', 'date')]
    if how != 'Count of rows' and not m:
        return [flag(STOP, 'Choose the measure, or set “Add up by” to “Count of rows”.', 'measure')]
    dates = df[dt].dropna()
    span = (dates.max() - dates.min()).days if len(dates) else 0
    if span < 60:
        out.append(flag(STOP, f'The dates cover only {span} days: too short for a trend.', 'date'))
    elif span < 330:
        out.append(flag(WARN, f'The dates cover {span} days. That shows the level and short changes; a yearly trend, a seasonal pattern or a forecast to plan on needs at least a year.', 'date'))
    if m and how == 'Total' and NOT_ADDITIVE.search(m):
        out.append(flag(WARN, f'“{m}” sounds like a score, time or rate: adding it up over a period means little. Choose “Average”.', 'how'))
    ids = [str(c) for c in df.columns if g._id_like(str(c), df[c])]
    if ids and dates.dt.normalize().nunique() < len(df) / 5 and how != 'Count of rows':
        out.append(flag(TIP, f'Each row is a person or case (“{ids[0]}”) with one date. This shows whether results changed across those dates. To compare groups of people, use Group comparison.'))
    return out


def check_survey(d, p, df, cols):
    return _group_checks(df, cols['group'], 'group', 'group')


def check_before(d, p, df, cols):
    b, a, grp = cols['before'], cols['after'], cols['group']
    out = []
    if not b or not a:
        return [flag(STOP, 'Choose the measure before and the same measure after.', 'before')]
    tb, ta = g.time_marker(b), g.time_marker(a)
    if tb and ta and tb[0] == ta[0] and tb[1] > ta[1]:
        out.append(flag(STOP, f'“{b}” and “{a}” look swapped: the earlier measurement goes first.', 'before'))
    elif (AFTER.search(b) and not AFTER.search(a)) or (BEFORE.search(a) and not BEFORE.search(b)):
        out.append(flag(STOP, f'“{b}” and “{a}” look swapped: the measure before goes first.', 'before'))
    elif tb and ta and tb[0] != ta[0] and tb[0] and ta[0]:
        out.append(flag(WARN, f'“{b}” and “{a}” have different names apart from the time: are they the same measure?', 'after'))
    mb, ma = df[b].abs().mean(), df[a].abs().mean()
    if mb and ma and max(mb, ma) / min(mb, ma) > 3:
        out.append(flag(WARN, f'“{b}” averages {g.nf(mb)} and “{a}” {g.nf(ma)}: are they the same measure in the same units?', 'after'))
    arm = g._arm(d)
    if not grp and arm:
        out.append(flag(WARN, f'This table has “{arm}”. Choose it under “Took part or not” to measure the effect against the comparison group; without it, changes that hit everyone count as the effect.', 'group'))
    out += _group_checks(df, grp, 'group', 'group')
    if grp and df[grp].dropna().nunique() > 2:
        out.append(flag(TIP, f'“{grp}” has more than two values: the effect compares the group that changed most with the one that changed least.', 'group'))
    return out


def check_quality(d, p, df, cols):
    m, order, smp = cols['measure'], cols['order'], cols['sample']
    out = []
    if not m:
        return [flag(STOP, 'Choose the measurement.', 'measure')]
    lsl, usl = p.get('lsl'), p.get('usl')
    if lsl is not None and usl is not None and float(lsl) >= float(usl):
        out.append(flag(STOP, 'The lower specification limit must be below the upper one.', 'lsl'))
    ids = [str(c) for c in df.columns if g._id_like(str(c), df[c])]
    if ids and not PROCESS.search(m):
        out.append(flag(WARN, f'Each row looks like a person or case (“{ids[0]}”), and “{m}” doesn’t sound like a process measurement. Control charts are for one process measured again and again; to compare people, use Group comparison.', 'measure'))
    if not order and not smp:
        out.append(flag(WARN, 'No time order chosen. The run rules (8 in a row, 6 rising) only mean something if the rows are in time order. Choose the time column, or confirm the file is already in order.', 'order'))
    v = df[m].dropna()
    for key, lim in (('lsl', lsl), ('usl', usl)):
        if lim is not None and len(v) and v.std() > 0 and abs(float(lim) - v.mean()) > 20 * v.std():
            out.append(flag(WARN, f'The {"lower" if key == "lsl" else "upper"} limit {g.nf(float(lim))} is far from the data (average {g.nf(v.mean())}). Check the units.', key))
    if smp:
        sizes = df.groupby(smp)[m].count()
        if sizes.median() > 10:
            out.append(flag(WARN, f'Samples of about {int(sizes.median())} items: control charts here work with samples of 2 to 10. Leave “Sample” empty to chart each measurement.', 'sample'))
    return out


def check_groups(d, p, df, cols):
    out = _group_checks(df, cols['label'], 'label', 'label to compare with')
    k = int(float(p.get('k') or 0))
    if k >= 2 and len(df) < 20 * k:
        out.append(flag(WARN, f'{k} groups on {len(df):,} rows: under 20 rows a group, the groups will be unstable.', 'k'))
    nums = [c for c in df.columns if g.kind_of(str(c), df[c]) == 'number']
    if len(nums) < 2:
        out.append(flag(STOP, 'Needs at least two number columns to group on.'))
    return out


CHECKS = {
    'group-comparison': (check_compare, {'measure': 'measure', 'group': 'group'}),
    'what-drives-an-outcome': (check_drivers, {'outcome': 'outcome'}),
    'trend-and-forecast-for-any-measure': (check_trend, {'date': 'date', 'measure': 'measure'}),
    'survey-and-questionnaire-analysis': (check_survey, {'group': 'group'}),
    'before-and-after-impact': (check_before, {'before': 'before', 'after': 'after', 'group': 'group'}),
    'quality-and-process-control': (check_quality, {'measure': 'measurement', 'order': 'time order', 'sample': 'sample'}),
    'natural-groups': (check_groups, {'label': 'label'}),
    'data-profile': (lambda d, p, df, cols: [], {}),
}


def advise(service_id: str, d: Data, p: dict) -> list[dict]:
    """Flags on the chosen settings, before anything runs."""
    if service_id not in CHECKS:
        return []
    fn, labels = CHECKS[service_id]
    df, cols = _table(d, p, list(labels))
    if df is None:
        return [flag(STOP, 'Upload a table and confirm it as “Any other table” on the Files page.')]
    out = []
    if service_id != 'data-profile' and not str(p.get('question') or '').strip():
        out.append(flag(STOP, 'Write the client’s question first. It goes above the result, and it decides which columns to choose.', 'question'))
    out += _common(df, cols, labels)
    try:
        out += fn(d, p, df, cols)
    except Exception as e:  # noqa: BLE001 - a guide must never break the screen
        out.append(flag(WARN, f'The settings couldn’t be fully checked ({type(e).__name__}).'))
    seen, uniq = set(), []
    for f in out:  # the same message once
        if f['text'] not in seen:
            seen.add(f['text'])
            uniq.append(f)
    return sorted(uniq, key=lambda f: [STOP, WARN, TIP].index(f['level']))


# ---------- What was compared, in one sentence ----------

_PLAN = {'Compared': 'compare', 'Explained': 'explain', 'Followed': 'follow', 'Analysed': 'analyse', 'Charted': 'chart', 'Grouped': 'group', 'Read': 'read'}


def plan(service_id: str, p: dict) -> str | None:
    """The same sentence, before running: 'compare “Score after” between …'."""
    done = setup(service_id, p)
    if not done:
        return None
    first, rest = done.split(' ', 1)
    return f'{_PLAN.get(first, first.lower())} {rest}'


def setup(service_id: str, p: dict) -> str | None:
    c = {k: (str(v).split(g.SEP)[0] if v else None) for k, v in p.items()}
    q = lambda k: f'“{c[k]}”'  # noqa: E731
    match service_id:
        case 'group-comparison' if c.get('measure') and c.get('group'):
            return f'Compared {q("measure")} between the groups in {q("group")}.'
        case 'what-drives-an-outcome' if c.get('outcome'):
            return f'Explained {q("outcome")} with the other columns in the table.'
        case 'trend-and-forecast-for-any-measure' if c.get('date'):
            what = 'the number of rows' if (p.get('how') == 'Count of rows' or not c.get('measure')) else f'the {str(p.get("how") or "Total").lower()} of {q("measure")}'
            return f'Followed {what} over {q("date")}.'
        case 'survey-and-questionnaire-analysis':
            return 'Analysed every rating question' + (f', compared by {q("group")}.' if c.get('group') else '.')
        case 'before-and-after-impact' if c.get('before') and c.get('after'):
            return f'Compared {q("before")} with {q("after")}' + (f', against the comparison group in {q("group")}.' if c.get('group') else ', without a comparison group.')
        case 'quality-and-process-control' if c.get('measure'):
            lim = [f'{k} {g.nf(float(p[x]))}' for k, x in (('lower limit', 'lsl'), ('upper limit', 'usl')) if p.get(x) is not None]
            return f'Charted {q("measure")}' + (f' in samples of {q("sample")}' if c.get('sample') else '') + (f' in the order of {q("order")}' if c.get('order') else ' in file order') + (f', against a {" and ".join(lim)}' if lim else '') + '.'
        case 'natural-groups':
            return 'Grouped the rows on every number column' + (f' into {int(float(p["k"]))} groups' if p.get('k') and float(p['k']) >= 2 else '') + (f', compared with {q("label")}.' if c.get('label') else '.')
        case 'data-profile':
            return 'Read every column of the table.'
    return None


_ = np  # kept for the checks above that may grow numeric tests
