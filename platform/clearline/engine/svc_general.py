"""Any data: eight services for tables that aren't sales, accounts or staff files. Research results, surveys,
patient or student records, programme data, machine readings. The analyst picks the columns; the method adapts
to what the columns hold."""

from __future__ import annotations

import re
import warnings

import numpy as np
import pandas as pd
from scipy import stats

from .core import Ctx, Data, NeedsData, Param, Service, bars, chart, choice_param, column_param, finding, heatmap, kpi, line, result, series, table

SEP = ' · '  # "Score · survey_2025.xlsx" when there is more than one table

# ---------- Columns ----------


def _id_like(name: str, s: pd.Series) -> bool:
    v = s.dropna()
    if len(v) < 5:
        return False
    if re.search(r'(?i)(^|[\s_\-])(id|code|no|number|ref|رقم|كود)($|[\s_\-])|^#$', str(name)):
        return v.nunique() > 0.8 * len(v)
    if pd.api.types.is_numeric_dtype(v) and v.nunique() == len(v) and (v.sort_values().diff().dropna() == 1).mean() > 0.9:
        return True  # 1, 2, 3, ... a row number
    return False


def kind_of(name: str, s: pd.Series) -> str:
    """number, binary, category, date, text (ids, names, comments) or empty."""
    v = s.dropna()
    if not len(v):
        return 'empty'
    if pd.api.types.is_datetime64_any_dtype(s):
        return 'date'
    n = v.nunique()
    if n <= 1:
        return 'empty'
    if _id_like(name, s):
        return 'text'
    if n == 2:
        return 'binary'
    if pd.api.types.is_numeric_dtype(s):
        return 'number'
    if n <= 40 and (n <= 0.5 * len(v) or len(v) < 30):
        return 'category'
    return 'text'


FITS = {
    'number': {'number'},
    'outcome': {'number', 'binary'},
    'category': {'category', 'binary'},
    'date': {'date'},
    'any': {'number', 'binary', 'category', 'date'},
    'batch': {'category', 'binary'},
    'binary': {'binary'},
}


def _small_ints(s: pd.Series) -> bool:
    v = s.dropna()
    return pd.api.types.is_numeric_dtype(v) and v.nunique() <= 12 and bool((v == v.round()).all())


def _fits(name: str, s: pd.Series, fits: str) -> bool:
    k = kind_of(name, s)
    if fits == 'category' and k == 'number' and _small_ints(s):
        return True  # a group coded 1, 2, 3
    if fits == 'batch' and k == 'number':
        v = s.dropna()
        return bool((v == v.round()).all() and 2 <= v.nunique() <= len(v) / 2)  # sample numbers that repeat: 1,1,1,2,2,2
    return k in FITS.get(fits, FITS['any'])


def column_choices(d: Data, fits: str) -> list[str]:
    many = len(d.files) > 1
    return [f'{col}{SEP}{name}' if many else str(col) for name, df in d.files.items() for col in df.columns if _fits(str(col), df[col], fits)]


def _resolve(d: Data, ref: str) -> tuple[str, str]:
    """(file, column) for a column choice."""
    if not d.files:
        raise NeedsData('Upload the table and confirm it as “Any other table” on the Files page.')
    if SEP in ref:
        col, name = ref.rsplit(SEP, 1)
        if name in d.files and col in d.files[name].columns:
            return name, col
    for name, df in d.files.items():
        if ref in df.columns:
            return name, ref
    raise NeedsData(f'There is no column “{ref}” in the files any more. Choose the columns again.')


def pick(c: Ctx, need: dict[str, str]) -> tuple[pd.DataFrame, dict[str, str | None]]:
    """The table and column names for the chosen settings. All from one file."""
    d = c.data
    cols: dict[str, str | None] = {}
    file = None
    for key, label in need.items():
        ref = c.p.get(key)
        if not ref:
            cols[key] = None
            continue
        name, col = _resolve(d, ref)
        if col in cols.values():
            raise NeedsData(f'“{col}” is chosen for two settings. Choose a different column for each.')
        if file and name != file:
            raise NeedsData('Choose columns from the same file: rows can only be matched within one table.')
        file = name
        cols[key] = col
    if file is None:
        file = max(d.files, key=lambda k: len(d.files[k])) if d.files else None
    if file is None:
        raise NeedsData('Upload the table and confirm it as “Any other table” on the Files page.')
    return d.files[file], cols


# Column names that suggest a role, strongest hint first. The first pattern any column matches wins.
_PREFER = {
    'outcome': [r'after|post|endline|final|follow.?up|بعد', r'outcome|result|repaid|passed|success|نتيجة', r'score|grade|mark|درجة'],
    'measure': [r'after|post|endline|final|بعد', r'outcome|result|score|grade|mark|value|level|total|amount|minutes|time|rate|weight|height|reading|output|درجة|نتيجة|قيمة'],
    'arm': [r'^(group|arm|treatment|treated|condition|cohort|intervention)$', r'took.?part|participa|treat|arm|programme|program|intervention|control|مجموعة|مشارك'],
    'group': [r'^(group|arm|treatment|condition)$', r'took.?part|participa|treat|arm|programme|program', r'school|clinic|site|branch|class|region|area|village|machine|line|shift|ward|department|type|مدرسة|فرع|نوع', r'gender|sex'],
    'before': [r'before|pre|baseline|start|initial|قبل'],
    'after': [r'after|post|endline|end|final|follow|بعد'],
    'date': [r'date|day|month|week|time|تاريخ'],
}


def _guess(d: Data, fits: str, prefer: list[str] | None = None, avoid: set[str] = frozenset(), fallback: bool = True) -> str | None:
    options = [o for o in column_choices(d, fits) if o not in avoid]
    if not options:
        return None
    for pat in prefer or []:
        for o in options:
            if re.search(pat, o.split(SEP)[0], re.I):
                return o
    return options[0] if fallback else None


def _needs(fits_list: list[tuple[str, int]], msg: str):
    """An adjust check: the table must hold enough columns of each kind."""

    def adjust(d: Data, level: str):
        if not d.files:
            return None
        for fits, n in fits_list:
            if len(column_choices(d, fits)) < n:
                return ('none', msg)
        return None

    return adjust


def cat(s: pd.Series) -> pd.Series:
    """Values as text labels; blanks stay blank (never the word 'nan')."""
    return s.map(lambda v: np.nan if pd.isna(v) else (str(int(v)) if isinstance(v, float) and v == int(v) else str(v)))


# ---------- Formatting ----------


def nf(x: float) -> str:
    if x is None or not np.isfinite(x):
        return '–'
    a = abs(x)
    s = f'{x:,.0f}' if a >= 1000 else f'{x:,.1f}' if a >= 10 else f'{x:,.2f}' if a >= 0.1 else f'{x:.3g}'
    return s.replace('-', '−')


def snf(x: float) -> str:
    return ('+' if x > 0 else '') + nf(x)


def pv(p: float) -> str:
    return 'p < 0.001' if p < 0.001 else f'p = {p:.3f}'


def sure(p: float) -> str:
    """How sure, in words: the chance a gap this big appears by luck alone."""
    if p < 0.01:
        return 'very unlikely to be chance'
    if p < 0.05:
        return 'unlikely to be chance'
    if p < 0.1:
        return 'possibly chance'
    return 'quite possibly just chance'


def _effect_words(v: float, cuts: tuple[float, float, float]) -> str:
    v = abs(v)
    return 'negligible' if v < cuts[0] else 'small' if v < cuts[1] else 'medium' if v < cuts[2] else 'large'


def _level_by_n(n: int, hi: int, mid: int) -> str:
    return 'high' if n >= hi else 'medium' if n >= mid else 'low'


# ---------- 1. Data profile ----------


def profile(c: Ctx) -> dict:
    d = c.data
    if not d.files:
        raise NeedsData('Upload the table and confirm it as “Any other table” on the Files page.')
    kpis_rows = sum(len(df) for df in d.files.values())
    charts, findings, notes = [], [], []
    total_cells = filled_cells = 0
    gappy = []
    for name, df in list(d.files.items())[:6]:
        rows = []
        filled = []
        for col in df.columns:
            s = df[col]
            k = kind_of(str(col), s)
            share = s.notna().mean()
            total_cells += len(s)
            filled_cells += s.notna().sum()
            filled.append((str(col), share * 100))
            v = s.dropna()
            odd = ''
            if k in ('number',) and len(v) >= 8:
                q1, q3 = v.quantile([0.25, 0.75])
                iqr = q3 - q1
                far = int(((v < q1 - 3 * iqr) | (v > q3 + 3 * iqr)).sum()) if iqr > 0 else 0
                odd = f'{far:,} far from the rest' if far else ''
                summ = f'median {nf(v.median())}, {nf(v.min())} to {nf(v.max())}'
            elif k == 'date':
                summ = f'{v.min():%d %b %Y} to {v.max():%d %b %Y}'
            elif k in ('category', 'binary'):
                top = v.astype(str).value_counts(normalize=True)
                summ = ', '.join(f'{i} {p:.0%}' for i, p in top.head(3).items())
            elif k == 'empty':
                summ = 'always the same value' if len(v) else 'empty'
            else:
                summ = 'identifier' if _id_like(str(col), s) else f'free text, e.g. “{str(v.iloc[0])[:30]}”'
            rows.append([str(col), {'number': 'Number', 'binary': 'Two values', 'category': 'Category', 'date': 'Date', 'text': 'Text', 'empty': '–'}[k], f'{share:.0%}', f'{v.nunique():,}', summ, odd or '–'])
            if share < 1 and len(s):
                gappy.append((share, f'{col} ({int(s.isna().sum()):,} blank, {share:.0%} filled)'))
            if odd:
                findings.append(finding(f'“{col}” has {odd}: check they are real and not typing mistakes.', 'high', 'Look at those rows before using this column in a comparison.'))
        label = f' · {name}' if len(d.files) > 1 else ''
        filled.sort(key=lambda x: x[1])
        charts.append(chart(f'How complete each column is (%){label}', bars([f[0] for f in filled[:25]], [f[1] for f in filled[:25]], 'pct', horizontal=True, tones=['orange' if f[1] < 80 else 'accent' for f in filled[:25]])))
        charts.append(chart(f'Column by column{label}', table(['Column', 'Holds', 'Filled', 'Different values', 'Summary', 'Unusual'], rows), wide=True))
        nums = [col for col in df.columns if kind_of(str(col), df[col]) == 'number'][:12]
        if len(nums) >= 2 and len(df) >= 10:
            r = df[nums].corr(method='spearman')
            charts.append(chart(f'Which numbers move together{label} (rank correlation)', heatmap([str(x) for x in nums], [str(x) for x in nums], [[None if not np.isfinite(v) else round(float(v), 2) for v in row] for row in r.values]), wide=True))
            pairs = [(abs(r.iloc[i, j]), nums[i], nums[j], r.iloc[i, j]) for i in range(len(nums)) for j in range(i + 1, len(nums)) if np.isfinite(r.iloc[i, j])]
            for _, a, b, v in sorted(pairs, reverse=True)[:3]:
                if abs(v) >= 0.6:
                    findings.append(finding(f'“{a}” and “{b}” move {"together" if v > 0 else "in opposite directions"} (rank correlation {v:.2f}).', 'high', 'A link, not proof that one causes the other; “What drives an outcome” tests it properly.'))
        dupes = int(df.duplicated().sum())
        if dupes:
            findings.append(finding(f'{dupes:,} rows in {name} appear twice.', 'high', 'Confirm whether they are repeated entries or genuinely identical cases.'))
    gappy = [g for _, g in sorted(gappy)]
    if gappy:
        findings.insert(0, finding(f'Columns with gaps: {", ".join(gappy[:6])}.', 'high', 'Results using these columns rest on the filled rows only; ask whether blanks mean zero, not asked, or unknown.'))
    share = filled_cells / max(total_cells, 1)
    filled_text = '100%' if filled_cells == total_cells else f'{min(share, 0.999):.1%}' if share > 0.99 else f'{share:.0%}'
    findings.insert(0, finding(f'{kpis_rows:,} rows across {len(d.files)} table{"s" if len(d.files) > 1 else ""}, {filled_text} of cells filled.', 'high'))
    return result(
        [kpi('Rows', f'{kpis_rows:,}'), kpi('Columns', f'{sum(df.shape[1] for df in d.files.values()):,}'), kpi('Cells filled', filled_text, tone='good' if filled_cells / max(total_cells, 1) >= 0.9 else 'bad'), kpi('Columns with gaps', str(len(gappy)))],
        charts,
        findings[:10],
        notes=notes,
    )


# ---------- 2. Group comparison ----------


def _binary01(s: pd.Series) -> tuple[pd.Series, str]:
    """A two-value column as 0/1, with the name of the value counted as 1."""
    v = s.dropna()
    vals = list(pd.unique(v))
    pos = r'^(1|1\.0|yes|y|true|pass(ed)?|success|positive|improved|cured|نعم|ناجح)$'
    one = next((x for x in vals if re.match(pos, str(x).strip(), re.I)), None)
    if one is None:
        one = max(vals) if pd.api.types.is_numeric_dtype(v) else v.value_counts().index[-1]
    return s.map(lambda x: np.nan if pd.isna(x) else float(x == one)), str(one)


def compare_groups(c: Ctx) -> dict:
    df, cols = pick(c, {'measure': 'Measure', 'group': 'Group'})
    m, g = cols['measure'], cols['group']
    if not m or not g:
        raise NeedsData('Choose the measure and the column that names each group.')
    x = df[[m, g]].dropna().copy()
    x[g] = cat(x[g])
    sizes = x[g].value_counts()
    keep = sizes[sizes >= 2].head(12).index
    dropped = int(len(sizes) - len(keep))
    x = x[x[g].isin(keep)]
    if x[g].nunique() < 2:
        raise NeedsData('Fewer than two groups with at least two rows each.')
    binary = kind_of(m, df[m]) == 'binary'
    notes = [f'{dropped} small group{"s" if dropped > 1 else ""} (one row, or beyond the 12 largest) left out.'] if dropped else []
    if binary:
        y, one = _binary01(x[m])
        x = x.assign(_y=y)
        rate = x.groupby(g)['_y'].agg(['mean', 'size']).sort_values('mean', ascending=False)
        ct = pd.crosstab(x[g], x['_y'])
        if ct.shape == (2, 2) and (ct.values < 5).any():
            p = float(stats.fisher_exact(ct.values)[1])
            test = 'Fisher’s exact test'
        else:
            chi2, p, *_ = stats.chi2_contingency(ct.values)
            test = 'chi-square test'
        v = np.sqrt(stats.chi2_contingency(ct.values)[0] / (len(x) * (min(ct.shape) - 1))) if min(ct.shape) > 1 else 0
        gap = rate['mean'].iloc[0] - rate['mean'].iloc[-1]
        level = _level_by_n(int(rate['size'].min()), 30, 10)
        return result(
            [kpi('Groups compared', str(len(rate))), kpi('Rows used', f'{len(x):,}'), kpi(f'Gap in “{one}” rate', f'{gap * 100:.1f} points', f'{rate.index[0]} vs {rate.index[-1]}'), kpi('Real difference?', 'Yes' if p < 0.05 else 'Not shown', pv(p), 'good' if p < 0.05 else None)],
            [chart(f'Share “{one}” by group (%)', bars(list(rate.index), list(rate['mean'] * 100), 'pct', horizontal=True)), chart('Groups', table(['Group', 'Rows', f'“{one}”'], [[i, f'{int(r["size"]):,}', f'{r["mean"]:.1%}'] for i, r in rate.iterrows()], numeric=[1, 2]))],
            [
                finding(f'{rate.index[0]} has the highest “{one}” rate ({rate["mean"].iloc[0]:.1%}) and {rate.index[-1]} the lowest ({rate["mean"].iloc[-1]:.1%}). The gap is {sure(p)} ({test}, {pv(p)}).', level),
                finding(f'The strength of the link is {_effect_words(v, (0.1, 0.3, 0.5))} (Cramér’s V {v:.2f}).', 'high'),
                finding('This shows a difference between groups, not what causes it: the groups may differ in other ways too.', 'high', 'Use “What drives an outcome” to allow for other factors.'),
            ],
            accuracy=f'{test.capitalize()} on {len(x):,} rows.',
            notes=notes,
        ) | {'level': level}
    x = x.copy()
    x[m] = x[m].astype(float)
    grp = x.groupby(g)[m]
    st = grp.agg(['size', 'mean', 'std', 'median']).sort_values('mean', ascending=False)
    st['se'] = st['std'] / np.sqrt(st['size'])
    st['lo'] = st['mean'] - stats.t.ppf(0.975, (st['size'] - 1).clip(lower=1)) * st['se']
    st['hi'] = st['mean'] + stats.t.ppf(0.975, (st['size'] - 1).clip(lower=1)) * st['se']
    arrays = [grp.get_group(k).values for k in st.index]
    skewed = abs(stats.skew(x[m])) > 2 or any(len(a) < 15 and len(a) > 2 and abs(stats.skew(a)) > 1 for a in arrays)
    two = len(arrays) == 2
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        if two:
            p_par = float(stats.ttest_ind(arrays[0], arrays[1], equal_var=False).pvalue)
            p_rank = float(stats.mannwhitneyu(arrays[0], arrays[1]).pvalue)
            sp = np.sqrt(((len(arrays[0]) - 1) * arrays[0].var(ddof=1) + (len(arrays[1]) - 1) * arrays[1].var(ddof=1)) / max(len(x) - 2, 1))
            eff = (arrays[0].mean() - arrays[1].mean()) / sp if sp > 0 else 0.0
            eff_text = f'Cohen’s d {abs(eff):.2f}'
            words = _effect_words(eff, (0.2, 0.5, 0.8))
            names = ('Welch t-test', 'Mann–Whitney test')
        else:
            try:
                p_par = float(stats.alexandergovern(*arrays).pvalue)
            except Exception:  # noqa: BLE001
                p_par = float(stats.f_oneway(*arrays).pvalue)
            p_rank = float(stats.kruskal(*arrays).pvalue)
            ssb = sum(len(a) * (a.mean() - x[m].mean()) ** 2 for a in arrays)
            sst = ((x[m] - x[m].mean()) ** 2).sum()
            eff = ssb / sst if sst > 0 else 0.0
            eff_text = f'eta² {eff:.2f}'
            words = _effect_words(eff, (0.01, 0.06, 0.14))
            names = ('Welch ANOVA', 'Kruskal–Wallis test')
    p, test = (p_rank, names[1]) if skewed else (p_par, names[0])
    if not np.isfinite(p):
        p, test = (p_par, names[0]) if np.isfinite(p_par) else (p_rank, names[1])
    if not np.isfinite(p):
        raise NeedsData('Every value is the same within each group, so there is nothing to test.')
    level = _level_by_n(int(st['size'].min()), 30, 10)
    findings = [
        finding(f'{st.index[0]} averages {nf(st["mean"].iloc[0])} and {st.index[-1]} {nf(st["mean"].iloc[-1])}. The difference is {sure(p)} ({test}, {pv(p)}).', level),
        finding(f'The size of the difference is {words} ({eff_text}).', 'high', None if words != 'negligible' else 'Even if real, a difference this small may not matter in practice.'),
    ]
    if not two and p < 0.05:
        try:
            tk = stats.tukey_hsd(*arrays)
            pairs = sorted(((tk.pvalue[i, j], st.index[i], st.index[j], st['mean'].iloc[i] - st['mean'].iloc[j]) for i in range(len(arrays)) for j in range(i + 1, len(arrays))), key=lambda t: t[0])
            real = [f'{a} vs {b} ({snf(dlt)})' for pp, a, b, dlt in pairs if pp < 0.05][:4]
            if real:
                findings.append(finding('Pairs that differ (Tukey’s test, allowing for many comparisons): ' + '; '.join(real) + '.', 'high'))
        except Exception:  # noqa: BLE001
            pass
    if two and p >= 0.05:
        mdd = 2.8 * np.sqrt(sum(a.var(ddof=1) / len(a) for a in arrays))
        findings.append(finding(f'With groups this size, a true gap smaller than about {nf(mdd)} could go unseen.', 'high', 'More rows would settle it.'))
    findings.append(finding('This shows a difference between groups, not what causes it.', 'high', 'Use “What drives an outcome” to allow for other factors.'))
    other = names[0] if skewed else names[1]
    return result(
        [kpi('Groups compared', str(len(st))), kpi('Rows used', f'{len(x):,}'), kpi('Highest vs lowest', snf(st['mean'].iloc[0] - st['mean'].iloc[-1]), f'{st.index[0]} vs {st.index[-1]}'), kpi('Real difference?', 'Yes' if p < 0.05 else 'Not shown', pv(p), 'good' if p < 0.05 else None)],
        [
            chart(f'Average “{m}” by group', bars(list(st.index), list(st['mean']), 'num', horizontal=True)),
            chart('Groups', table(['Group', 'Rows', 'Average', 'Median', '95% range of the average'], [[i, f'{int(r["size"]):,}', nf(r['mean']), nf(r['median']), f'{nf(r["lo"])} to {nf(r["hi"])}'] for i, r in st.iterrows()], numeric=[1, 2, 3]), wide=True),
        ],
        findings,
        accuracy=f'{test} chosen because the values are {"skewed" if skewed else "roughly symmetric"}' + (f'; the {other} gives {pv(p_par if skewed else p_rank)}.' if np.isfinite(p_par if skewed else p_rank) else '.'),
        notes=notes,
    ) | {'level': level}


# ---------- 3. What drives an outcome ----------


def _design(x: pd.DataFrame, factors: list[str]) -> tuple[pd.DataFrame, dict[str, str]]:
    """Number columns standardised (an effect per one standard deviation); categories as yes/no columns against
    the most common value."""
    parts, labels = [], {}
    for col in factors:
        s = x[col]
        rating = None if pd.api.types.is_numeric_dtype(s) else _likert(s)
        if rating is not None:  # Strongly disagree … Strongly agree: one ordered score, not five separate answers
            parts.append((rating - rating.mean()).rename(col))  # centred, in scale steps
            labels[col] = f'{col} (one step up the scale)'
            continue
        if pd.api.types.is_numeric_dtype(s) and s.nunique() > 2:
            sd = s.std()
            parts.append(((s - s.mean()) / sd).rename(col))
            labels[col] = f'{col} (+1 SD = {nf(sd)})'
        else:
            v = cat(s)
            top = v.value_counts()
            v = v.where(v.isin(top.index[:6]), 'Other')
            yesno = {x.strip().lower() for x in v.dropna().unique()} <= {'yes', 'no', 'نعم', 'لا', 'true', 'false', 'y', 'n'}
            base = next((x for x in v.dropna().unique() if x.strip().lower() in ('no', 'لا', 'false', 'n')), None) if yesno else None
            base = base if base is not None else v.value_counts().index[0]
            dummies = pd.get_dummies(v, prefix=col, prefix_sep=': ').astype(float).drop(columns=f'{col}: {base}')
            for dc in dummies.columns:
                labels[dc] = f'{dc} (vs {base})'
            parts.append(dummies)
    X = pd.concat(parts, axis=1)
    X = X.loc[:, X.std() > 0]
    return X, labels


def drivers(c: Ctx) -> dict:
    import statsmodels.api as sm
    from sklearn.linear_model import LinearRegression, LogisticRegression
    from sklearn.model_selection import cross_val_score

    df, cols = pick(c, {'outcome': 'Outcome'})
    o = cols['outcome']
    if not o:
        raise NeedsData('Choose the outcome to explain.')
    binary = kind_of(o, df[o]) == 'binary'
    cand = [col for col in df.columns if col != o and (kind_of(str(col), df[col]) in ('number', 'binary', 'category') or _likert(df[col]) is not None) and df[col].notna().mean() >= 0.7]
    x = df[[o] + cand].dropna(subset=[o]).copy()
    if binary:
        x[o], one = _binary01(x[o])
    if not cand:
        raise NeedsData('No other usable columns to test as factors.')
    # Keep the factors most linked to the outcome, about one per 10 rows.
    def link(col):
        s = x[col]
        try:
            if pd.api.types.is_numeric_dtype(s) and s.nunique() > 2:
                return abs(stats.spearmanr(s, x[o], nan_policy='omit')[0])
            return x.groupby(s.astype(str))[o].mean().std() / (x[o].std() or 1)
        except Exception:  # noqa: BLE001
            return 0
    cand = sorted(cand, key=lambda col: -np.nan_to_num(link(col)))
    cap = max(1, min(12, len(x.dropna()) // 10 - 1))
    factors = cand[:cap]
    x = x[[o] + factors].dropna()
    if len(x) < 20:
        raise NeedsData('Fewer than 20 complete rows: too few to separate the factors.')
    X, labels = _design(x, factors)
    y = x[o].astype(float)
    Xc = sm.add_constant(X)
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        try:
            fit = sm.Logit(y, Xc).fit(disp=0, maxiter=200) if binary else sm.OLS(y, Xc).fit(cov_type='HC3')
        except Exception as e:  # noqa: BLE001
            raise NeedsData(f'The model couldn’t be fitted on these columns ({e}). Try fewer factors or more rows.') from e
        if binary:
            fewer = int(min(y.sum(), len(y) - y.sum()))
            score = float(np.mean(cross_val_score(LogisticRegression(max_iter=2000), X.values, y.values, cv=min(5, fewer), scoring='roc_auc'))) if fewer >= 2 else float('nan')
        else:
            score = float(np.mean(cross_val_score(LinearRegression(), X.values, y.values, cv=5, scoring='r2')))
    ci = fit.conf_int()
    rows = []
    for name in X.columns:
        b, p = float(fit.params[name]), float(fit.pvalues[name])
        lo, hi = float(ci.loc[name, 0]), float(ci.loc[name, 1])
        if binary:
            rows.append((name, np.exp(b), np.exp(lo), np.exp(hi), p, b / max(float(fit.bse[name]), 1e-12)))
        else:
            rows.append((name, b, lo, hi, p, b / max(float(fit.bse[name]), 1e-12)))
    # A factor that splits the outcome perfectly (everyone with it passed) has no finite effect: name it instead.
    usable = [r for r in rows if all(np.isfinite(v) for v in r[1:5]) and (not binary or 1e-6 < r[1] < 1e6)]
    lost = [labels[r[0]] for r in rows if r not in usable]
    rows = usable
    # Testing many factors at once, a few look real by luck: adjust each p-value for how many were tested
    # (Benjamini–Hochberg), so "clear" means clear after allowing for that.
    if rows:
        raw_p = np.array([r[4] for r in rows])
        order_ = np.argsort(raw_p)
        adj = np.empty_like(raw_p)
        running = 1.0
        for rank, idx in reversed(list(enumerate(order_, 1))):
            running = min(running, raw_p[idx] * len(raw_p) / rank)
            adj[idx] = running
        rows = [(r[0], r[1], r[2], r[3], float(a), r[5]) for r, a in zip(rows, adj)]
    if not rows:
        raise NeedsData('The factors repeat each other too closely to be separated. Try fewer columns.')
    rows.sort(key=lambda r: -abs(r[5]))
    sig = [r for r in rows if r[4] < 0.05]
    findings = []
    for name, eff, lo, hi, p, _ in sig[:4]:
        if binary:
            findings.append(finding(f'{labels[name]}: “{o}: {one}” is {nf(eff)} times as likely in odds terms (95% range {nf(lo)} to {nf(hi)}, {pv(p)}).', 'high' if p < 0.01 else 'medium'))
        else:
            findings.append(finding(f'{labels[name]}: “{o}” changes by {snf(eff)} (95% range {snf(lo)} to {snf(hi)}, {pv(p)}).', 'high' if p < 0.01 else 'medium'))
    weak = [labels[r[0]].split(' (')[0] for r in rows if r[4] >= 0.05]
    if weak:
        findings.append(finding(f'No clear link once the others are allowed for: {", ".join(dict.fromkeys(weak[:6]))}.', 'high'))
    if not sig:
        findings.insert(0, finding('None of the factors shows a clear link with the outcome on these rows.', 'medium', 'More rows, or other factors, may be needed.'))
    findings.append(finding('These are links in the data, not proof of cause: something not recorded may drive both.', 'high', 'For a firm answer, an experiment or a before-and-after with a comparison group is needed.'))
    if lost:
        findings.append(finding(f'Left out, because they repeat other factors or split the outcome perfectly: {", ".join(lost[:4])}.', 'low', 'Look at these columns directly: a perfect split is often a column recorded after the outcome.'))
    if len(cand) > len(factors):
        findings.append(finding(f'{len(cand) - len(factors)} weaker columns weren’t tested, to keep about ten rows per factor.', 'low'))
    fit_label, fit_value = ('Prediction quality (AUC)', f'{score:.2f}') if binary else ('Explained on unseen rows (R²)', f'{max(score, 0):.0%}')
    good = (score > 0.7) if binary else (score > 0.3)
    level = 'high' if good and len(x) >= 100 else 'medium' if len(x) >= 40 else 'low'
    unit = 'odds ratio, 1 = no effect' if binary else f'change in {o}'
    return result(
        [kpi('Rows used', f'{len(x):,}'), kpi('Factors tested', str(len(factors))), kpi(fit_label, fit_value, 'checked on rows the model did not see', 'good' if good else None), kpi('Strongest factor', labels[rows[0][0]].split(' (')[0] if sig else 'No clear factor')],
        [
            chart(f'Effect of each factor ({unit})', bars([labels[r[0]] for r in rows[:15]], [r[1] for r in rows[:15]], 'num', horizontal=True, tones=['green' if r[4] < 0.05 and (r[1] > (1 if binary else 0)) else 'orange' if r[4] < 0.05 else 'muted' for r in rows[:15]])),
            chart('Every factor', table(['Factor', 'Effect', '95% range', 'Sure it’s real?'], [[labels[r[0]], nf(r[1]), f'{nf(r[2])} to {nf(r[3])}', f'{sure(r[4]).capitalize()} ({pv(r[4])})'] for r in rows], numeric=[1]), wide=True),
        ],
        findings,
        accuracy=(f'Logistic regression; tested by 5-fold cross-validation: AUC {score:.2f} (0.5 is a coin toss, 1 is perfect).' if binary else f'Multiple regression with robust (HC3) errors; tested by 5-fold cross-validation: R² {score:.2f} on rows the model did not see.') + f' p-values adjusted for testing {len(rows)} effects at once (Benjamini–Hochberg).',
        notes=['Green: a clear link that raises the outcome. Orange: a clear link that lowers it. Grey: not clear.'],
    ) | {'level': level}


# ---------- 4. Trend and forecast for any measure ----------

FREQS = {'MS': ('month', 12, 6), 'W-MON': ('week', 52, 12), 'D': ('day', 7, 28)}


def _series(df: pd.DataFrame, date: str, measure: str | None, how: str) -> tuple[pd.Series, str]:
    x = df[[date] + ([measure] if measure else [])].dropna(subset=[date])
    span = (x[date].max() - x[date].min()).days
    freq = 'MS' if span >= 720 else 'W-MON' if span >= 120 else 'D'
    key = x[date].dt.to_period({'MS': 'M', 'W-MON': 'W-SUN', 'D': 'D'}[freq]).dt.start_time
    if how == 'Count of rows' or not measure:
        y = x.groupby(key).size().astype(float)
        fill = 0.0
    elif how == 'Average':
        y = x.dropna(subset=[measure]).groupby(key)[measure].mean()
        fill = np.nan
    else:
        y = x.dropna(subset=[measure]).groupby(key)[measure].sum()
        fill = 0.0
    full = pd.date_range(y.index.min(), y.index.max(), freq=freq)
    y = y.reindex(full, fill_value=fill) if fill == 0.0 else y.reindex(full)
    # Drop a first or last period the data only partly covers.
    first, last = x[date].min(), x[date].max()
    step = {'MS': pd.offsets.MonthBegin(1), 'W-MON': pd.Timedelta(days=7), 'D': pd.Timedelta(days=1)}[freq]
    if len(y) > 3 and first > y.index[0] + pd.Timedelta(days=2) and freq != 'D':
        y = y.iloc[1:]
    if len(y) > 3 and last < y.index[-1] + step - pd.Timedelta(days=3) and freq != 'D':
        y = y.iloc[:-1]
    return y.interpolate(limit_direction='both'), freq


def _label(ts: pd.Timestamp, freq: str) -> str:
    return ts.strftime('%b %y') if freq == 'MS' else ts.strftime('%d %b %y')


def _contest(y: pd.Series, freq: str, h: int, season: int) -> tuple[dict, str, float, float]:
    from statsforecast import StatsForecast
    from statsforecast.models import AutoARIMA, AutoETS, AutoTheta, Naive, SeasonalNaive

    seasonal = len(y) >= 2 * season and season <= 52
    sl = season if seasonal else 1
    models = [AutoETS(season_length=sl, alias='ETS'), AutoTheta(season_length=sl, alias='Theta'), AutoARIMA(season_length=sl, alias='ARIMA')]
    if seasonal:
        models.append(SeasonalNaive(sl, alias='Seasonal naive'))

    def run(series, horizon, level=None):
        df = pd.DataFrame({'unique_id': 'x', 'ds': series.index, 'y': series.values.astype(float)})
        out = {}
        for mdl in models + [Naive(alias='Last value')]:
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore')
                    fc = StatsForecast(models=[mdl], freq=freq).forecast(df=df, h=horizon, level=[level] if level else None)
                a = mdl.alias
                out[a] = (fc[a].values, fc[f'{a}-lo-{level}'].values if level else None, fc[f'{a}-hi-{level}'].values if level else None)
            except Exception:  # noqa: BLE001
                continue
        return out

    test = min(h, max(3, len(y) // 5))
    actual = y.iloc[-test:].values
    scale = np.mean(np.abs(actual)) or 1.0
    errs = {k: float(np.mean(np.abs(actual - v[0])) / scale) for k, v in run(y.iloc[:-test], test).items()}
    naive = errs.pop('Last value', np.inf)
    if not errs:
        raise NeedsData('None of the forecasting models could fit this series.')
    best = min(errs, key=errs.get)
    fc = run(y, h, 80)
    if best not in fc:
        raise NeedsData('The best model couldn’t forecast this series.')
    return fc[best], best, errs[best], naive


def trend_forecast(c: Ctx) -> dict:
    df, cols = pick(c, {'date': 'Date', 'measure': 'Measure'})
    dcol, mcol = cols['date'], cols['measure']
    if not dcol:
        raise NeedsData('Choose the date column.')
    how = c.p.get('how') or 'Total'
    if how != 'Count of rows' and not mcol:
        raise NeedsData('Choose the measure, or set “Add up by” to “Count of rows”.')
    y, freq = _series(df, dcol, mcol, how)
    unit, season, h = FREQS[freq]
    n = len(y)
    if n < 8:
        raise NeedsData(f'Fewer than eight {unit}s of data: too short for a trend.')
    what = f'{how.lower()} of “{mcol}”' if how != 'Count of rows' else 'number of rows'
    t = np.arange(n)
    # With a strong yearly or weekly pattern, test the trend once the pattern is taken out: otherwise the seasons hide it.
    base = y.values
    seasonal_fit = None
    if n >= 2 * season and season <= 52:
        from statsmodels.tsa.seasonal import STL

        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            seasonal_fit = STL(y, period=season, robust=True).fit()
        base = (y - seasonal_fit.seasonal).values
    tau, p_trend = stats.kendalltau(t, base)
    slope = float(stats.theilslopes(base, t)[0])
    level_now = float(np.median(y.values)) or 1.0
    span_days = (y.index[-1] - y.index[0]).days + {'MS': 30, 'W-MON': 7, 'D': 1}[freq]
    # Under a year of data, say how much it changed over the period seen; don't stretch it to a yearly rate.
    per_year = slope * {'MS': 12, 'W-MON': 52, 'D': 365}[freq]
    short = span_days < 330
    change = slope * (n - 1) if short else per_year
    over = f'over the {span_days} days covered' if short else 'a year'
    trend_word = ('Rising' if slope > 0 else 'Falling') if p_trend < 0.05 else 'No clear trend'
    findings = [finding(f'{trend_word}: the {what} {"changes" if p_trend < 0.05 else "moves"} by about {snf(change)} {over} ({snf(change / abs(level_now) * 100)}% of its usual level); the trend is {sure(p_trend)} (Mann–Kendall{", after taking out the seasonal pattern" if seasonal_fit is not None else ""}, {pv(p_trend)}).', 'high' if n >= 24 and not short else 'medium')]
    if short and freq == 'D':
        findings.append(finding(f'Only {span_days} days of data: enough to see the level, too short for a lasting trend or a forecast to plan on.', 'high', 'For a trend, use at least a year of data.'))
    charts = []
    seas_strength = 0.0
    if seasonal_fit is not None:
        st = seasonal_fit
        seas_strength = max(0.0, 1 - np.var(st.resid) / max(np.var(st.seasonal + st.resid), 1e-12))
        # Claim a repeating pattern only if it is strong and the values really differ by month or weekday.
        pos = y.index.month if freq == 'MS' else y.index.dayofweek if freq == 'D' else None
        p_seas = 1.0
        if pos is not None:
            detr = y.values - (st.trend.values if hasattr(st.trend, 'values') else st.trend)
            parts = [detr[pos == k] for k in np.unique(pos)]
            parts = [q for q in parts if len(q) >= 2]
            if len(parts) >= 2:
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore')
                    p_seas = float(stats.kruskal(*parts).pvalue)
        if seas_strength > 0.3 and p_seas < 0.01:
            prof = pd.Series(st.seasonal.values, index=y.index)
            key = prof.index.month if freq == 'MS' else prof.index.dayofweek if freq == 'D' else prof.index.isocalendar().week.values
            prof = prof.groupby(key).mean()
            names = {'MS': lambda k: pd.Timestamp(2001, int(k), 1).strftime('%b'), 'D': lambda k: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][int(k)], 'W-MON': lambda k: f'W{int(k)}'}[freq]
            if freq != 'W-MON':
                charts.append(chart(f'Usual effect of each {"month" if freq == "MS" else "weekday"}', bars([names(k) for k in prof.index], list(prof.values), 'num', tones=['green' if v == prof.max() else 'orange' if v == prof.min() else 'accent' for v in prof.values])))
            findings.append(finding(f'A strong repeating pattern: {names(prof.idxmax())} is usually highest and {names(prof.idxmin())} lowest ({pv(p_seas)}).', 'high'))
    labels = [_label(ts, freq) for ts in y.index]
    fc_kpi = kpi('Forecast', '–', 'needs a longer history')
    acc = None
    level = 'medium'
    if n >= max(12, 2 * min(h, n // 5) + 6):
        (point, lo, hi), best, err, naive = _contest(y, freq, h, season)
        if how != 'Average' and (y >= 0).all():
            point, lo, hi = np.maximum(point, 0), np.maximum(lo, 0), np.maximum(hi, 0)
        future = pd.date_range(y.index[-1], periods=h + 1, freq=freq)[1:]
        labels += [_label(ts, freq) for ts in future]
        charts.insert(0, chart(f'{what[0].upper()}{what[1:]} by {unit}, with a forecast', line(labels, [series('Actual', list(y.values) + [None] * h), series(f'Forecast ({best})', [None] * (n - 1) + [float(y.values[-1])] + list(point), dashed=True)], band={'lo': [None] * n + list(lo), 'hi': [None] * n + list(hi), 'name': '80% range'}, fmt='num'), wide=True))
        agg = point.sum() if how != 'Average' else point.mean()
        fc_kpi = kpi(f'Next {h} {unit}s', nf(agg), 'total' if how != 'Average' else 'average')
        findings.append(finding(f'Next {h} {unit}s: about {nf(agg)} {"in total" if how != "Average" else "on average"}; {best} won the test on the last {unit}s it hadn’t seen, off by {err:.1%} on average.', 'low' if short else 'high' if err < 0.1 else 'medium' if err < 0.2 else 'low'))
        if err >= naive:
            findings.append(finding(f'The model was no better than repeating the last value (off by {naive:.1%}): read the forecast as a rough guide.', 'high'))
        acc = f'Each model was fitted without the last {unit}s, then compared with what happened: {best} was off by {err:.1%}; repeating the last value was off by {naive:.1%}.'
        level = 'high' if err < 0.1 and n >= 2 * season else 'medium' if err < 0.2 else 'low'
        if short:
            level = 'low'
    else:
        charts.insert(0, chart(f'{what[0].upper()}{what[1:]} by {unit}', line(labels, [series('Actual', list(y.values))], fmt='num'), wide=True))
    return result(
        [kpi('Trend', trend_word, pv(p_trend), 'good' if p_trend < 0.05 else None), kpi(f'Change over {span_days} days' if short else 'Change a year', snf(change), f'{snf(change / abs(level_now) * 100)}% of the usual level'), fc_kpi, kpi(f'{unit.capitalize()}s of data', str(n))],
        charts,
        findings,
        accuracy=acc,
        notes=[f'Grouped by {unit}; ' + ('the first or last ' + unit + ' was left out where only partly covered.' if freq != 'D' else 'days without rows count as zero.' if how != 'Average' else 'days without rows are filled in from the days around them.')],
    ) | {'level': level}


# ---------- 5. Survey and questionnaire analysis ----------

SCALES = {
    1: r'^(strongly disagree|very dissatisfied|very poor|never|very unlikely|لا أوافق بشدة|غير راض تماما|غير راضٍ تمامًا|أبدا|أبدًا)$',
    2: r'^(disagree|dissatisfied|poor|rarely|unlikely|لا أوافق|غير راض|غير راضٍ|نادرا|نادرًا)$',
    3: r'^(neutral|neither agree nor disagree|neither|fair|sometimes|average|okay|ok|محايد|أحيانا|أحيانًا|مقبول)$',
    4: r'^(agree|satisfied|good|often|likely|أوافق|راض|راضٍ|غالبا|غالبًا|جيد)$',
    5: r'^(strongly agree|very satisfied|very good|excellent|always|very likely|أوافق بشدة|راض تماما|راضٍ تمامًا|دائما|دائمًا|ممتاز)$',
}


def _likert(s: pd.Series) -> pd.Series | None:
    """A rating question as numbers, or None if the column isn't one."""
    v = s.dropna()
    if len(v) < 5:
        return None
    if pd.api.types.is_numeric_dtype(v):
        # A usual rating scale: 1–4, 1–5, 1–7, 0–10, 1–10 and the like. A count such as household size (2–8) isn't one.
        if (v == v.round()).all() and 3 <= v.nunique() <= 11 and v.min() in (0, 1) and v.max() in (4, 5, 6, 7, 10):
            return s.astype(float)
        return None
    t = s.astype(str).str.strip().str.lower()

    def score(x):
        for k, pat in SCALES.items():
            if re.match(pat, x, re.I):
                return float(k)
        lead = re.match(r'^(\d{1,2})\b', x)  # "4 - agree"
        return float(lead.group(1)) if lead else np.nan

    out = t.map(lambda x: np.nan if x in ('nan', 'none', '') else score(x))
    return out if out.notna().sum() >= 0.9 * len(v) and out.nunique() >= 3 else None


def survey(c: Ctx) -> dict:
    df, cols = pick(c, {'group': 'Group'})
    g = cols['group']
    items = {}
    for col in df.columns:
        if col == g or _id_like(str(col), df[col]):
            continue
        sc = _likert(df[col])
        if sc is not None:
            items[str(col)] = sc
    cats = [col for col in df.columns if col != g and str(col) not in items and kind_of(str(col), df[col]) in ('category', 'binary')]
    if not items and not cats:
        raise NeedsData('No rating questions (1–5, 0–10 or agree/disagree answers) or multiple-choice questions found in this table.')
    n = len(df)
    charts, findings = [], []
    rng = {}
    for k, s in items.items():
        rng[k] = (s.min(), s.max())
    main_range = pd.Series([f'{a:g}–{b:g}' for a, b in rng.values()]).mode().iloc[0] if items else ''
    rows, agree = [], {}
    for k, s in items.items():
        lo, hi = rng[k]
        cut = hi - (hi - lo) * 0.25
        a = (s >= cut).mean() / max(s.notna().mean(), 1e-9)
        b = (s <= lo + (hi - lo) * 0.25).mean() / max(s.notna().mean(), 1e-9)
        agree[k] = a
        rows.append([k, f'{int(s.notna().sum()):,}', nf(s.mean()), f'{lo:g}–{hi:g}', f'{a:.0%}', f'{b:.0%}'])
    alpha = None
    if items:
        order = sorted(agree, key=agree.get, reverse=True)
        charts.append(chart('Share giving a top answer, by question (%)', bars(order, [agree[k] * 100 for k in order], 'pct', horizontal=True, tones=['green' if agree[k] >= 0.6 else 'orange' if agree[k] < 0.4 else 'accent' for k in order])))
        charts.append(chart('Every rating question', table(['Question', 'Answers', 'Average', 'Scale', 'Top answers', 'Bottom answers'], [rows[list(items).index(k)] for k in order], numeric=[1, 2, 4, 5]), wide=True))
        findings.append(finding(f'Strongest: “{order[0]}” ({agree[order[0]]:.0%} top answers). Weakest: “{order[-1]}” ({agree[order[-1]]:.0%}).', 'high' if n >= 100 else 'medium'))
        same = [k for k in items if f'{rng[k][0]:g}–{rng[k][1]:g}' == main_range]
        if len(same) >= 3:
            m = pd.DataFrame({k: items[k] for k in same}).dropna()
            if len(m) >= 10:
                kk = m.shape[1]
                tv = m.sum(axis=1).var(ddof=1)
                alpha = kk / (kk - 1) * (1 - m.var(ddof=1).sum() / tv) if tv > 0 else np.nan
                word = 'excellent' if alpha >= 0.9 else 'good' if alpha >= 0.8 else 'acceptable' if alpha >= 0.7 else 'questionable' if alpha >= 0.6 else 'poor'
                findings.append(finding(f'The {kk} questions on the {main_range} scale can be added up into one score: their reliability is {word} (Cronbach’s alpha {alpha:.2f}).' if word != 'poor' else f'The {kk} questions on the {main_range} scale don’t measure one thing (Cronbach’s alpha {alpha:.2f}): report them one by one, not as a total.', 'high'))
    if g:
        x = df.copy()
        x[g] = cat(x[g])
        counts = x[g].value_counts()
        groups = list(counts[counts >= 5].index[:8])
        if len(groups) >= 2 and items:
            res = []
            for k, s in items.items():
                arrays = [s[x[g] == gg].dropna().values for gg in groups]
                if all(len(a) >= 3 for a in arrays):
                    res.append((k, float(stats.kruskal(*arrays).pvalue)))
            if res:
                ps = np.array([r[1] for r in res])
                order_p = np.argsort(ps)
                adj = np.empty_like(ps)
                m_ = len(ps)
                running = 1.0
                for rank, idx in reversed(list(enumerate(order_p, 1))):  # Benjamini–Hochberg
                    running = min(running, ps[idx] * m_ / rank)
                    adj[idx] = running
                means = [[round(float(items[k][x[g] == gg].mean()), 2) for gg in groups] for k, _ in res]
                charts.append(chart(f'Average answer by {g}', heatmap([k for k, _ in res], groups, means), wide=True))
                diff = [res[i][0] for i in range(len(res)) if adj[i] < 0.05]
                if diff:
                    findings.append(finding(f'Answers differ by {g} on {len(diff)} of {len(res)} questions: {", ".join(diff[:5])} (Kruskal–Wallis, corrected for testing many questions).', 'high'))
                else:
                    findings.append(finding(f'No question shows a clear difference by {g} (Kruskal–Wallis, corrected for testing many questions).', 'high'))
    for col in cats[:3]:
        vc = cat(df[col]).value_counts()
        share = (vc / vc.sum() * 100).round(1)
        charts.append(chart(f'“{col}”: answers', table(['Answer', 'Count', 'Share'], [[i, f'{int(vc[i]):,}', f'{share[i]:.1f}%'] for i in vc.index[:12]], numeric=[1, 2])))
    moe = 1.96 * np.sqrt(0.25 / max(n, 1))
    findings.append(finding(f'With {n:,} respondents, a percentage is accurate to about ±{moe:.0%}, if they were chosen at random.', 'high', 'If people chose to answer (an open link), the results describe those who answered, not everyone.'))
    level = _level_by_n(n, 100, 30)
    return result(
        [kpi('Respondents', f'{n:,}'), kpi('Rating questions', str(len(items))), kpi('Reliability (alpha)', f'{alpha:.2f}' if alpha is not None and np.isfinite(alpha) else '–', None if alpha is not None else 'needs 3+ questions on one scale', 'good' if alpha is not None and alpha >= 0.7 else None), kpi('Margin of error', f'±{moe:.0%}')],
        charts,
        findings,
        accuracy='Top answers: the top quarter of each scale (4–5 of 5, 9–10 of 10).',
    ) | {'level': level}


# ---------- 6. Before-and-after impact ----------


def before_after(c: Ctx) -> dict:
    df, cols = pick(c, {'before': 'Before', 'after': 'After', 'group': 'Group'})
    b, a, g = cols['before'], cols['after'], cols['group']
    if not b or not a or a == b:
        raise NeedsData('Choose two different columns: the measure before and the same measure after.')
    x = df[[b, a] + ([g] if g else [])].dropna(subset=[b, a]).copy()
    if len(x) < 5:
        raise NeedsData('Fewer than five rows with both a before and an after value.')
    x = x.assign(_d=x[a].astype(float) - x[b].astype(float))
    d = x['_d']
    mean, se = d.mean(), d.std(ddof=1) / np.sqrt(len(d))
    tcrit = stats.t.ppf(0.975, len(d) - 1)
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        p_t = float(stats.ttest_rel(x[a], x[b]).pvalue)
        p_w = float(stats.wilcoxon(d).pvalue) if (d != 0).sum() >= 5 else np.nan
    skewed = abs(stats.skew(d)) > 1.5 and len(d) < 50
    p, test = (p_w, 'Wilcoxon signed-rank test') if skewed and np.isfinite(p_w) else (p_t, 'paired t-test')
    up, down = (d > 0).mean(), (d < 0).mean()
    rel = x[a].mean() / x[b].mean() - 1 if x[b].mean() else np.nan
    findings = [finding(f'On average the measure changed by {snf(mean)} from “{b}” to “{a}” (95% range {snf(mean - tcrit * se)} to {snf(mean + tcrit * se)}); the change is {sure(p)} ({test}, {pv(p)}).', _level_by_n(len(d), 30, 12)),
                finding(f'{up:.0%} of rows went up, {down:.0%} went down and {1 - up - down:.0%} stayed the same.', 'high')]
    charts = [chart('Average before and after', bars([str(b), str(a)], [float(x[b].mean()), float(x[a].mean())], 'num', tones=['muted', 'accent']))]
    kpis = [kpi('Pairs', f'{len(x):,}'), kpi('Average before', nf(x[b].mean())), kpi('Average after', nf(x[a].mean())), kpi('Change', snf(mean), f'{snf(rel * 100)}%' if np.isfinite(rel) else None, 'good' if p < 0.05 else None)]
    level = 'medium' if len(d) >= 30 else 'low'
    acc = f'{test.capitalize()} on {len(d):,} pairs.'
    if g:
        x[g] = cat(x[g])
        # "Yes" and "No" alone read badly: name them with the column ("Took part: Yes").
        if set(x[g].dropna().str.lower().unique()) <= {'yes', 'no', 'نعم', 'لا', 'true', 'false', 'y', 'n', '1', '0'}:
            x[g] = g + ': ' + x[g]
        st = x.groupby(g)['_d'].agg(['size', 'mean', 'std'])
        st = st[st['size'] >= 3].sort_values('mean', ascending=False)
        if len(st) >= 2:
            arrays = [x.loc[x[g] == k, '_d'].values for k in st.index]
            with warnings.catch_warnings():
                warnings.simplefilter('ignore')
                p_g = float(stats.ttest_ind(arrays[0], arrays[-1], equal_var=False).pvalue) if len(st) == 2 else float(stats.f_oneway(*arrays).pvalue)
            did = st['mean'].iloc[0] - st['mean'].iloc[-1]
            charts.append(chart(f'Average change by {g}', bars(list(st.index), list(st['mean']), 'num', horizontal=True)))
            findings.insert(1, finding(f'{st.index[0]} changed by {snf(st["mean"].iloc[0])} and {st.index[-1]} by {snf(st["mean"].iloc[-1])}: a gap of {snf(did)} that is {sure(p_g)} ({pv(p_g)}). If {st.index[-1]} is the comparison group, this gap is the estimated effect (difference-in-differences).', 'high' if p_g < 0.05 and st['size'].min() >= 30 else 'medium'))
            kpis[3] = kpi('Effect vs comparison', snf(did), f'{st.index[0]} vs {st.index[-1]}', 'good' if p_g < 0.05 else None)
            level = 'high' if st['size'].min() >= 30 else 'medium' if st['size'].min() >= 10 else 'low'
            acc += ' Difference-in-differences: each group’s average change compared, so changes that hit everyone cancel out.'
    else:
        findings.append(finding('Without a comparison group, other things that changed at the same time (season, prices, a new manager) could explain part of the change.', 'high', 'Add a column marking who took part and who didn’t, to measure the effect itself.'))
    if not g and len(d) >= 10:
        r = stats.spearmanr(x[b], x['_d'])[0]
        if r < -0.4:
            findings.append(finding('Rows that started low improved most and those that started high fell back: part of this is natural levelling out (regression to the mean), not the programme.', 'medium'))
    return result(kpis, charts, findings, accuracy=acc) | {'level': level}


# ---------- 7. Quality and process control ----------

# Constants for averages of small samples (X-bar and R charts), by sample size.
A2 = {2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308}
D3 = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223}
D4 = {2: 3.267, 3: 2.574, 4: 2.282, 5: 2.114, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777}
d2 = {2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970, 10: 3.078}


def _rules(v: np.ndarray, centre: float, sigma: float) -> dict[int, str]:
    """Points that break the standard control-chart rules, with the first rule each breaks."""
    out: dict[int, str] = {}
    z = (v - centre) / sigma if sigma > 0 else np.zeros_like(v)
    for i, zi in enumerate(z):
        if abs(zi) > 3:
            out[i] = 'beyond the limits'
    for i in range(8, len(v) + 1):
        w = z[i - 8 : i]
        if (w > 0).all() or (w < 0).all():
            out.setdefault(i - 1, '8 in a row on one side')
    for i in range(6, len(v) + 1):
        w = np.diff(v[i - 6 : i])
        if (w > 0).all() or (w < 0).all():
            out.setdefault(i - 1, '6 in a row rising or falling')
    for i in range(3, len(v) + 1):
        w = z[i - 3 : i]
        if (w > 2).sum() >= 2 or (w < -2).sum() >= 2:
            out.setdefault(i - 1, '2 of 3 near a limit')
    return out


def _stable_centre(v: np.ndarray, sigma: float) -> float:
    """The process's usual level: the average once points beyond the limits are set aside, repeated until none are.
    A shift late in the data then shows as a shift, instead of pulling the centre line to the middle."""
    v = np.asarray(v, float)
    keep = np.ones(len(v), bool)
    for _ in range(10):
        centre = float(v[keep].mean())
        out = keep & (np.abs(v - centre) > 3 * sigma)
        if not out.any() or keep.sum() - out.sum() < max(8, len(v) // 3):
            break
        keep &= ~out
    return centre


def _first_signal(broken: dict[int, str], labels: list[str]) -> str | None:
    """Where a run of rule-breaking points starts, if most of them follow one point in time."""
    if not broken:
        return None
    first = min(broken)
    after = [i for i in broken if i >= first]
    return labels[first] if len(after) >= 0.7 * len(broken) else None


def quality(c: Ctx) -> dict:
    df, cols = pick(c, {'measure': 'Measurement', 'order': 'Order', 'sample': 'Sample'})
    m, o, smp = cols['measure'], cols['order'], cols['sample']
    if not m:
        raise NeedsData('Choose the measurement.')
    x = df[[m] + [k for k in (o, smp) if k]].dropna(subset=[m]).copy()
    if o:
        x = x.sort_values(o, kind='stable', na_position='last')
    lsl, usl = c.p.get('lsl'), c.p.get('usl')
    lsl = None if lsl is None or (isinstance(lsl, float) and not np.isfinite(lsl)) else float(lsl)
    usl = None if usl is None or (isinstance(usl, float) and not np.isfinite(usl)) else float(usl)
    if lsl is not None and usl is not None and lsl >= usl:
        raise NeedsData('The lower specification limit must be below the upper one.')
    vals = x[m].astype(float)
    xbar = False
    if smp:
        xs = x.dropna(subset=[smp])
        sizes = xs.groupby(smp, sort=False)[m].size()
        n_sub = int(sizes.mode().iloc[0]) if len(sizes) else 0
        if 2 <= n_sub <= 10 and (sizes == n_sub).mean() >= 0.8 and len(sizes) >= 8:
            xbar = True
    if xbar:
        grp = xs.groupby(smp, sort=False)[m]
        means, ranges = grp.mean().values, (grp.max() - grp.min()).values
        rbar = float(ranges.mean())
        centre = _stable_centre(means, A2[n_sub] * rbar / 3)
        ucl, lcl = centre + A2[n_sub] * rbar, centre - A2[n_sub] * rbar
        sigma_w = rbar / d2[n_sub]
        plot, labels = means, [str(k) for k in grp.mean().index]
        sigma_plot = sigma_w / np.sqrt(n_sub)
        chart_name = f'Sample averages (X-bar chart, samples of {n_sub})'
        method = f'X-bar and R chart on {len(means)} samples of {n_sub}'
    else:
        v = vals.values
        mr = np.abs(np.diff(v))
        sigma_w = float(mr.mean() / 1.128) if len(mr) else 0.0
        centre = _stable_centre(v, sigma_w)
        ucl, lcl = centre + 3 * sigma_w, centre - 3 * sigma_w
        plot = v
        dated = o and pd.api.types.is_datetime64_any_dtype(x[o])
        labels = [x[o].iloc[i].strftime('%d %b %y') if dated and pd.notna(x[o].iloc[i]) else str(i + 1) for i in range(len(v))]
        sigma_plot = sigma_w
        chart_name = 'Each measurement against its control limits'
        method = f'Individuals and moving-range chart on {len(v)} measurements'
    if len(plot) < 8:
        raise NeedsData('Fewer than eight points: a control chart needs at least 20 to be reliable.')
    broken = _rules(np.asarray(plot, float), centre, sigma_plot)
    show = slice(max(0, len(plot) - 400), len(plot))
    off = show.start
    marks = [{'index': i - off, 'label': '!', 'tone': 'red'} for i in sorted(broken) if i >= off][:60]
    n_pts = len(plot) - off
    charts = [chart(chart_name, line(labels[show], [series(str(m), list(np.asarray(plot, float)[show])), series('Centre', [centre] * n_pts, 'muted', True), series('Upper limit', [ucl] * n_pts, 'orange', True), series('Lower limit', [lcl] * n_pts, 'orange', True)], marks=marks, fmt='num'), wide=True)]
    stable = not broken
    # Even a steady process breaks one of these rules now and then: in simulations of steady processes, about 1.6% of
    # points. In a long series some breaks are expected by luck alone, so call it unstable only when there are more
    # than a steady process gives 99 times in 100 (checked against simulations for 80, 480 and 2,000 points).
    expected = 0.016 * len(plot)
    beyond = sum(1 for r in broken.values() if r == 'beyond the limits')
    exp_beyond = 0.0027 * len(plot)
    by_chance = bool(broken) and len(broken) <= expected + 3.75 * np.sqrt(expected) + 1.5 and beyond <= exp_beyond + 3 * np.sqrt(exp_beyond) + 2
    stable = stable or by_chance
    if by_chance:
        lead = f'The process is stable: {len(broken)} point{"s" if len(broken) > 1 else ""} break a rule, within what a steady process shows by chance in {len(plot):,} points (around {max(1, round(expected))}).'
    elif stable:
        lead = 'The process is stable: no point breaks the control-chart rules, so the variation is the normal kind.'
    else:
        lead = f'{len(broken)} point{"s" if len(broken) > 1 else ""} break the control-chart rules, where a steady process would show about {max(1, round(expected))} in {len(plot):,} points, so something unusual happened.'
    findings = [finding(lead, 'high' if len(plot) >= 25 else 'medium', None if stable else 'Look at what changed at those points (materials, shift, machine settings) before changing the process.')]
    start = _first_signal(broken, labels)
    if broken and not by_chance and start is not None and len(broken) >= 5:
        later = np.asarray(plot, float)[min(broken):]
        findings.insert(1, finding(f'The change starts around {"sample " if xbar else "point "}{start}: since then the average is {nf(later.mean())} against a usual {nf(centre)}.', 'high', 'Find what changed at that point: a new batch of material, a setting, a shift or a machine.'))
    if broken and not by_chance:
        kinds_ = pd.Series(list(broken.values())).value_counts()
        findings.append(finding('Rules broken: ' + ', '.join(f'{k} ({n})' for k, n in kinds_.items()) + '.', 'high'))
    cap_kpi = kpi('Capability (Cpk)', '–', 'add specification limits')
    acc = f'{method}; limits at 3 standard deviations, from the spread between neighbouring points.'
    if lsl is not None or usl is not None:
        mu, sd_all = float(vals.mean()), float(vals.std(ddof=1))
        cpk_parts = [(usl - mu) / (3 * sigma_w) if usl is not None else np.inf, (mu - lsl) / (3 * sigma_w) if lsl is not None else np.inf]
        cpk = min(cpk_parts) if sigma_w > 0 else np.nan
        outside = float(((vals < (lsl if lsl is not None else -np.inf)) | (vals > (usl if usl is not None else np.inf))).mean())
        expected = (stats.norm.cdf((lsl - mu) / sd_all) if lsl is not None else 0) + (stats.norm.sf((usl - mu) / sd_all) if usl is not None else 0) if sd_all > 0 else 0
        cap_kpi = kpi('Capability (Cpk)', f'{cpk:.2f}', '1.33 or more is capable' if stable else 'only meaningful once stable', 'good' if cpk >= 1.33 and stable else 'bad')
        word = 'capable' if cpk >= 1.33 else 'only just capable' if cpk >= 1.0 else 'not capable'
        findings.append(finding(f'Against the specification the process is {word} (Cpk {cpk:.2f}): {outside:.1%} of measurements were outside it, and about {expected * 1e6:,.0f} in a million are expected to be.' + ('' if stable else ' Capability assumes a stable process, so fix the cause of the change first.'), 'high' if len(plot) >= 25 and stable else 'medium', None if cpk >= 1.33 else 'Reduce the spread or re-centre the process.'))
        if lsl is not None and usl is not None and sigma_w > 0:
            cp = (usl - lsl) / (6 * sigma_w)
            if cp >= 1.33 > cpk:
                findings.append(finding(f'The spread would fit (Cp {cp:.2f}); the process is off-centre. Moving the average toward {nf((lsl + usl) / 2)} fixes most of it.', 'high'))
    level = 'high' if len(plot) >= 25 else 'medium' if len(plot) >= 12 else 'low'
    return result(
        [kpi('Points', f'{len(plot):,}'), kpi('Stable?', 'Yes' if stable else 'No', None, 'good' if stable else 'bad'), kpi('Points breaking the rules', str(len(broken))), cap_kpi],
        charts,
        findings,
        accuracy=acc,
        notes=['Red marks: points that break a rule. Limits show where the process’s own normal variation ends; they are not the specification.'],
    ) | {'level': level}


# ---------- 8. Natural groups ----------


def natural_groups(c: Ctx) -> dict:
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    from sklearn.preprocessing import StandardScaler
    from threadpoolctl import threadpool_limits

    df, cols = pick(c, {'label': 'Compare with'})
    lab = cols['label']
    nums = [col for col in df.columns if col != lab and kind_of(str(col), df[col]) == 'number' and df[col].notna().mean() >= 0.6][:15]
    if len(nums) < 2:
        raise NeedsData('Needs at least two number columns to group rows on.')
    x = df[nums].astype(float)
    x = x.fillna(x.median())
    lo, hi = x.quantile(0.01), x.quantile(0.99)
    z = StandardScaler().fit_transform(x.clip(lo, hi, axis=1))
    n = len(z)
    if n < 20:
        raise NeedsData('Fewer than 20 rows: too few to find groups.')
    k_set = int(c.p.get('k') or 0)
    sample = np.random.default_rng(0).choice(n, size=min(n, 3000), replace=False)
    fits = {}
    # One thread: k-means' parallel threads fight each other inside the web server and run 100 times slower.
    with threadpool_limits(1):
        for k in ([k_set] if k_set >= 2 else range(2, min(7, n // 10 + 1))):
            if k < 2 or k >= n:
                continue
            km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(z)
            fits[k] = (km, float(silhouette_score(z[sample], km.labels_[sample])))
    if not fits:
        raise NeedsData('Too few rows for that number of groups.')
    k = max(fits, key=lambda q: fits[q][1]) if k_set < 2 else k_set
    km, sil = fits[k]
    order = pd.Series(km.labels_).value_counts().index  # biggest group first
    name = {old: f'Group {i + 1}' for i, old in enumerate(order)}
    labels = pd.Series(km.labels_).map(name)
    zdf = pd.DataFrame(z, columns=nums).groupby(labels.values).mean().loc[[f'Group {i + 1}' for i in range(k)]]
    raw = x.groupby(labels.values).mean().loc[zdf.index]
    sizes = labels.value_counts().loc[zdf.index]
    findings = []
    for gname, row in zdf.iterrows():
        top = row.abs().sort_values(ascending=False).index[:3]
        desc = ', '.join(f'{"higher" if row[t] > 0 else "lower"} “{t}”' for t in top if abs(row[t]) >= 0.3) or 'close to average on everything'
        findings.append(finding(f'{gname} ({sizes[gname] / n:.0%} of rows): {desc}.', 'high' if sil > 0.5 else 'medium' if sil > 0.25 else 'low'))
    word = 'clearly separate' if sil > 0.5 else 'moderately separate' if sil > 0.25 else 'overlapping'
    findings.insert(0, finding(f'The rows fall into {k} groups that are {word} (silhouette {sil:.2f}).', 'high' if sil > 0.5 else 'medium' if sil > 0.25 else 'low', None if sil > 0.25 else 'Treat the groups as rough tendencies, not firm types.'))
    charts = [
        chart('Size of each group (%)', bars(list(zdf.index), list(sizes / n * 100), 'pct')),
        chart('How each group differs from the average (standard deviations)', heatmap(list(zdf.index), [str(q) for q in nums], [[round(float(v), 2) for v in r] for r in zdf.values]), wide=True),
        chart('Group averages', table(['Group', 'Rows'] + [str(q) for q in nums], [[g, f'{int(sizes[g]):,}'] + [nf(v) for v in raw.loc[g].values] for g in zdf.index], numeric=list(range(1, len(nums) + 2))), wide=True),
    ]
    if lab:
        lv = cat(df[lab]).fillna('(blank)').values
        ct = pd.crosstab(labels.values, lv, normalize='index') * 100
        ct = ct.loc[zdf.index]
        charts.append(chart(f'“{lab}” within each group (%)', table(['Group'] + [str(q) for q in ct.columns[:10]], [[g] + [f'{v:.0f}%' for v in ct.loc[g].values[:10]] for g in ct.index]), wide=True))
    level = 'high' if sil > 0.5 else 'medium' if sil > 0.25 else 'low'
    return result(
        [kpi('Rows grouped', f'{n:,}'), kpi('Groups', str(k), 'chosen automatically' if k_set < 2 else 'set by the analyst'), kpi('Separation', f'{sil:.2f}', word, 'good' if sil > 0.5 else None), kpi('Columns used', str(len(nums)))],
        charts,
        findings,
        accuracy=f'k-means on {len(nums)} standardised columns; {"the number of groups with the best silhouette score among 2 to 6" if k_set < 2 else f"{k} groups as set"}. Silhouette runs from −1 to 1: above 0.5 is a clear grouping.',
        notes=['Gaps filled with each column’s median; extreme values capped at the 1st and 99th percentile.'],
    ) | {'level': level}


# ---------- The services ----------


def _arm(d: Data, avoid: set[str] = frozenset()) -> str | None:
    """A two-value column that marks who took part (New method / Usual method, Yes / No), if the table has one."""
    return _guess(d, 'category', _PREFER['arm'], avoid, fallback=False)


# Settings start filled in only where a column's name says what it is; otherwise the analyst chooses.


def _d_compare(d: Data, client: dict) -> dict:
    m = _guess(d, 'outcome', _PREFER['measure'], fallback=False)
    avoid = {m} if m else set()
    return {'measure': m, 'group': _arm(d, avoid) or _guess(d, 'category', _PREFER['group'], avoid, fallback=False)}


def _d_drivers(d: Data, client: dict) -> dict:
    yes_no = _guess(d, 'binary', [r'^(repaid|passed|success|outcome|result|converted|churned|left|default)', r'repaid|passed|success|outcome|result|converted|churn|default'], fallback=False)
    return {'outcome': yes_no or _guess(d, 'outcome', _PREFER['outcome'], fallback=False)}


def _d_trend(d: Data, client: dict) -> dict:
    m = _guess(d, 'number', _PREFER['measure'], fallback=False)
    adds_up = bool(m and re.search(r'amount|total|sales|revenue|count|visits|admissions|cases|output|units|orders|calls|عدد|مبلغ', m.split(SEP)[0], re.I))
    return {'date': _guess(d, 'date', _PREFER['date']), 'measure': m, 'how': 'Total' if adds_up else 'Average' if m else 'Count of rows'}


def _d_survey(d: Data, client: dict) -> dict:
    return {'group': _arm(d)}


def _d_before(d: Data, client: dict) -> dict:
    b = _guess(d, 'number', _PREFER['before'], fallback=False)
    a = _guess(d, 'number', _PREFER['after'], {b} if b else set(), fallback=False)
    return {'before': b, 'after': a, 'group': _arm(d)}


def _d_quality(d: Data, client: dict) -> dict:
    m = _guess(d, 'number', [r'reading|measure|fill|weight|thickness|diameter|length|temperature|pressure|volume|\bml\b|\bmm\b|\bkg\b|قياس'], fallback=False)
    return {'measure': m, 'order': _guess(d, 'date', _PREFER['date'], fallback=False), 'sample': _guess(d, 'batch', [r'^(sample|batch|subgroup|lot)\b', r'sample|batch|subgroup|lot|دفعة'], {m} if m else set(), fallback=False)}


def _p_limit(key: str, label: str) -> Param:
    return Param(key, label, 0, 0, 0, None, 'limit')


ANY = [['table']]
NEED_ANY = 'Upload a table and confirm it as “Any other table” on the Files page.'
SERVICES = [
    Service('data-profile', 'general', 'Data profile', ANY, profile, data_text='Any table: Excel, CSV, a system export or a survey download', missing_text=NEED_ANY),
    Service('group-comparison', 'general', 'Group comparison', ANY, compare_groups, params=[column_param('measure', 'Measure to compare', 'outcome'), column_param('group', 'Column naming the group', 'category')], defaults=_d_compare, adjust=_needs([('outcome', 1), ('category', 1)], 'Needs a number column and a column naming the groups.')),
    Service('what-drives-an-outcome', 'general', 'What drives an outcome', ANY, drivers, params=[column_param('outcome', 'Outcome to explain', 'outcome')], defaults=_d_drivers, adjust=_needs([('outcome', 1), ('any', 2)], 'Needs an outcome column and at least one other column to test.')),
    Service('trend-and-forecast-for-any-measure', 'general', 'Trend and forecast for any measure', ANY, trend_forecast, params=[column_param('date', 'Date column', 'date'), column_param('measure', 'Measure', 'number', optional=True), choice_param('how', 'Add up by', ['Total', 'Average', 'Count of rows'])], defaults=_d_trend, adjust=_needs([('date', 1)], 'Needs a date column.')),
    Service('survey-and-questionnaire-analysis', 'general', 'Survey and questionnaire analysis', ANY, survey, params=[column_param('group', 'Compare answers by (optional)', 'category', optional=True)], defaults=_d_survey),
    Service('before-and-after-impact', 'general', 'Before-and-after impact', ANY, before_after, params=[column_param('before', 'Measure before', 'number'), column_param('after', 'The same measure after', 'number'), column_param('group', 'Took part or not (optional)', 'category', optional=True)], defaults=_d_before, adjust=_needs([('number', 2)], 'Needs two number columns: the measure before and after.')),
    Service('quality-and-process-control', 'general', 'Quality and process control', ANY, quality, params=[column_param('measure', 'Measurement', 'number'), column_param('order', 'Time order (optional)', 'date', optional=True), column_param('sample', 'Sample or batch (optional)', 'batch', optional=True), _p_limit('lsl', 'Lower specification limit (optional)'), _p_limit('usl', 'Upper specification limit (optional)')], defaults=_d_quality, adjust=_needs([('number', 1)], 'Needs a number column of measurements.')),
    Service('natural-groups', 'general', 'Natural groups', ANY, natural_groups, params=[Param('k', 'Number of groups (0 = choose automatically)', 0, 8, 1, 0), column_param('label', 'Compare with (optional)', 'category', optional=True)], adjust=_needs([('number', 2)], 'Needs at least two number columns.')),
]
