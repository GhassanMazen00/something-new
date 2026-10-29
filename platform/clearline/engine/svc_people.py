"""People: five services."""

from __future__ import annotations

import re

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from lifelines import KaplanMeierFitter
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from .core import Ctx, Data, NeedsData, Param, Service, bars, chart, finding, heatmap, kpi, line, result, series, table, text

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']


def _staff(d: Data) -> pd.DataFrame:
    s = d.t('staff').copy()
    s['employee_id'] = s['employee_id'].astype(str)
    return s.drop_duplicates('employee_id', keep='last')


def turnover(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = _staff(d)
    has_dates = s['leave_date'].notna().any() or s['hire_date'].notna().any()
    end = pd.concat([s['leave_date'], s['hire_date']]).max() if has_dates else pd.Timestamp.now()
    current = s[~s['left']]
    if has_dates and s['leave_date'].notna().any():
        year_ago = end - pd.Timedelta(days=365)
        leavers = s[s['leave_date'] > year_ago]
        head_start = s[(s['hire_date'].isna() | (s['hire_date'] <= year_ago)) & (s['leave_date'].isna() | (s['leave_date'] > year_ago))]
        rate = len(leavers) / max((len(head_start) + len(current)) / 2, 1)
        rate_label = 'Turnover, last 12 months'
    else:
        leavers = s[s['left']]
        rate = len(leavers) / max(len(s), 1)
        rate_label = 'Have left (whole file)'
    cost = leavers['salary'].sum() * 12 * 0.25 if leavers['salary'].notna().any() else np.nan
    by_role = s.groupby('role').agg(n=('left', 'size'), left=('left', 'sum'))
    by_role = by_role[by_role['n'] >= 5].assign(rate=lambda x: x['left'] / x['n']).sort_values('rate', ascending=False)
    km = KaplanMeierFitter().fit(s['tenure_years'].clip(lower=0).fillna(0) * 12, s['left'].astype(int))
    months = np.arange(0, min(61, int(km.timeline.max()) + 1))
    surv = km.survival_function_at_times(months).values
    first_year = 1 - float(km.survival_function_at_times(12).iloc[0])
    charts = [chart('Still employed after … months (Kaplan-Meier)', line([str(m) for m in months], [series('Still employed (%)', surv * 100)], 'num'))]
    if len(by_role) >= 2:
        charts.append(chart('Who leaves, by role (%)', bars(by_role.index, (by_role['rate'] * 100).values, 'num', horizontal=True, tones=['orange' if r > by_role['rate'].mean() * 1.3 else 'accent' for r in by_role['rate']])))
    findings = [finding(f'{f.pct(rate, 0)} of staff {"left in the last 12 months" if rate_label.startswith("Turnover") else "in this file have left"} ({len(leavers):,} {"person" if len(leavers) == 1 else "people"})' + (f', costing about {f.money(cost)} to replace.' if np.isfinite(cost) else '.'), 'high')]
    if len(by_role):
        findings.append(finding(f'{by_role.index[0]} has the highest turnover: {f.pct(by_role["rate"].iloc[0], 0)}.', 'high'))
    findings.append(finding(f'{f.pct(first_year, 0)} of new joiners leave within their first year.', 'medium', 'Better onboarding and a 6-month check-in are the cheapest fix.'))
    score = np.nan
    if c.level != 'low' and s['salary'].notna().mean() > 0.8:
        med = s.groupby('role')['salary'].transform('median')
        X = pd.DataFrame({'pay_vs_role': (s['salary'] / med.replace(0, np.nan)).replace([np.inf, -np.inf], np.nan).fillna(1.0), 'tenure': s['tenure_years'].fillna(0), 'overtime': s['overtime_hours'].fillna(0) if s['overtime_hours'].notna().any() else 0.0})
        X = pd.concat([X, pd.get_dummies(s['role'], prefix='role', drop_first=True, dtype=float)], axis=1).fillna(0)
        y = s['left'].astype(int).values
        if 0.05 < y.mean() < 0.95 and len(s) >= 50:
            model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, C=0.5))
            prob = cross_val_predict(model, X, y, cv=5, method='predict_proba')[:, 1]
            score = roc_auc_score(y, prob)
            if score >= 0.6:
                model.fit(X, y)
                cur = X.loc[current.index]
                risk = pd.Series(model.predict_proba(cur)[:, 1], index=current.index).sort_values(ascending=False).head(10)
                charts.append(chart('Highest risk of leaving (names hidden)', table(['Employee', 'Role', 'Branch', 'Pay vs role median', 'Risk'], [[s.loc[i, 'employee_id'], s.loc[i, 'role'], s.loc[i, 'branch'] or '–', f.spct(X.loc[i, 'pay_vs_role'] - 1, 0), f.pct(p, 0)] for i, p in risk.items()], [False, False, False, True, True], ['red' if p > 0.6 else 'amber' for p in risk.values]), wide=True))
                findings.append(finding('People paid below their role’s median are the most likely to leave.' if model[-1].coef_[0][0] < 0 else 'Pay compared with colleagues is not what drives leaving here.', 'high' if score > 0.7 else 'medium', 'Review pay for the people listed before they resign; replacing one costs about three months’ salary.'))
            else:
                findings.append(finding('The pattern behind who leaves isn’t clear enough to name individuals.', 'low', 'Use exit interviews and the employee survey instead.'))
    return result(
        [kpi('Staff today', f.num(len(current))), kpi(rate_label, f.pct(rate, 0), tone='bad' if rate > 0.2 else 'good'), kpi('Cost of replacing them', f.money(cost) if np.isfinite(cost) else '–', '25% of a year’s pay each'), kpi('Prediction test', f'AUC {score:.2f}' if np.isfinite(score) else 'Not run', 'cross-validated' if np.isfinite(score) else 'too few staff or no salaries', 'good' if np.isfinite(score) and score > 0.68 else None)],
        charts,
        findings,
        accuracy=f'Risk model checked by 5-fold cross-validation (each person scored by a model that never saw them): AUC {score:.2f}.' if np.isfinite(score) else None,
    )


def staffing(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = d.sales[d.sales['date'] > d.end - pd.Timedelta(days=91)]
    units = max(1, s['branch'].nunique()) if s['branch'] is not None and s['branch'].notna().any() else 1
    weeks = 13
    if s['hour'].notna().mean() > 0.5:
        hours = sorted(s['hour'].dropna().astype(int).unique())
        grid = s.groupby([s['date'].dt.dayofweek, s['hour'].astype('Int64')])['amount'].sum().unstack(fill_value=0).reindex(index=range(7), columns=hours, fill_value=0) / weeks / units
        need = np.where(grid.values > 0, np.maximum(1, np.ceil(grid.values / c.p['per'])), 0).astype(int)
        cols = [str(h) for h in hours]
        flat = [(need[k, i], k, hours[i]) for k in range(7) for i in range(len(hours))]
        g = grid.values
        pk = np.unravel_index(np.argmax(g), g.shape)
        qt = np.unravel_index(np.argmin(np.where(g > 0, g, np.inf)), g.shape)
        peak, quiet = (need[pk], pk[0], hours[pk[1]]), (need[qt], qt[0], hours[qt[1]])
        title = 'People needed on the floor' + (', average branch' if units > 1 else '')
        if peak[0] <= quiet[0]:
            text = f'At {f.money(c.p["per"])} of sales per person an hour, one person covers every open hour; the busiest time is {DAYS[peak[1]]} around {peak[2]}:00. Set the real productivity to plan rotas.'
        else:
            text = f'Need peaks at {peak[0]} {"person" if peak[0] == 1 else "people"} on {DAYS[peak[1]]} around {peak[2]}:00, and drops to {quiet[0]} on {DAYS[quiet[1]]} at {quiet[2]}:00.'
        lvl = 'medium'
    else:
        grid = s.groupby(s['date'].dt.dayofweek)['amount'].sum().reindex(range(7), fill_value=0) / weeks / units
        need = np.where(grid.values > 0, np.maximum(1, np.ceil(grid.values / (c.p['per'] * 10))), 0).astype(int)[None, :]
        cols = DAYS
        peak_day = int(np.argmax(need[0]))
        title = 'People needed per day (10-hour day)' + (', average branch' if units > 1 else '')
        text = f'{DAYS[peak_day]} needs the most people: {need[0][peak_day]}.'
        lvl = 'low'
    return result(
        [kpi('Staff-hours a week', f.num(need.sum() if need.shape[0] > 1 else need.sum() * 10), 'per branch' if units > 1 else None), kpi('Sales one person handles an hour', f.money(c.p['per']))],
        [chart(title, heatmap(DAYS if need.shape[0] > 1 else ['All'], cols, need.tolist(), 'num'), wide=True)],
        [finding(text, lvl, 'Move people from quiet hours to busy ones before hiring.'), finding(f'Based on {f.money(c.p["per"])} of sales per person per hour; set this to the client’s real productivity.', 'medium')],
        notes=([] if s['hour'].notna().mean() > 0.5 else ['No times in the sales file: the plan is by day only.']) + ['Rotas were not supplied, so need is shown against sales, not compared with today’s schedule.'],
    )


def _staffing_default(d: Data, client: dict) -> dict:
    s = d.sales[d.sales['date'] > d.end - pd.Timedelta(days=91)]
    front = 0
    if d.has('staff'):
        st = d.t('staff')
        front = int((~st['left'] & st['role'].astype(str).str.contains('sales|cashier|customer service|front|retail|مبيعات', case=False)).sum())
    front = front or 10
    per = s['amount'].sum() / (front * 13 * 48)
    return {'per': float(max(100, round(per, -2)))}


def payroll_scan(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    p = d.t('payroll').copy()
    p['employee_id'] = p['employee_id'].astype(str)
    p['m'] = p['month'].dt.to_period('M')
    flags = []
    if d.has('staff'):
        st = _staff(d).set_index('employee_id')
        ghost = p[~p['employee_id'].isin(st.index)]
        for emp, g in ghost.groupby('employee_id'):
            flags.append({'emp': emp, 'name': text(g['name'].iloc[0]), 'month': str(g['m'].max()), 'amount': (g['base'] + g['overtime']).sum(), 'why': f'Paid {g["m"].nunique()} months, not on the staff list', 'tone': 'red'})
        after = p.join(st['leave_date'], on='employee_id')
        after = after[after['leave_date'].notna() & (after['m'].dt.start_time > after['leave_date'] + pd.Timedelta(days=31))]
        for _, r in after.iterrows():
            flags.append({'emp': r['employee_id'], 'name': r['name'] or '–', 'month': str(r['m']), 'amount': r['base'] + r['overtime'], 'why': 'Paid after leaving', 'tone': 'red'})
    for (emp, m), g in p.groupby(['employee_id', 'm']):
        if len(g) > 1:
            flags.append({'emp': emp, 'name': text(g['name'].iloc[0]), 'month': str(m), 'amount': (g['base'] + g['overtime']).iloc[1:].sum(), 'why': 'Paid twice in the same month', 'tone': 'red'})
    med = p.groupby('employee_id')['overtime'].transform('median')
    spikes = p[(med > 0) & (p['overtime'] > 3.5 * med) & (p['overtime'] > p['overtime'].quantile(0.9))]
    for _, r in spikes.iterrows():
        flags.append({'emp': r['employee_id'], 'name': r['name'] or '–', 'month': str(r['m']), 'amount': r['overtime'], 'why': f'Overtime {r["overtime"] / max(med[_], 1):.1f}× their usual', 'tone': 'amber'})
    if p['account'].notna().any():
        shared = p.dropna(subset=['account']).groupby('account')['employee_id'].nunique()
        for acc in shared[shared > 1].index:
            emps = p[p['account'] == acc]['employee_id'].unique()
            flags.append({'emp': ', '.join(emps[:3]), 'name': '–', 'month': '–', 'amount': 0, 'why': f'One bank account paid for {len(emps)} people', 'tone': 'red'})
    value = sum(x['amount'] for x in flags)
    findings = []
    ghost = [x for x in flags if 'not on the staff list' in x['why']]
    if ghost:
        findings.append(finding(f'{len(ghost)} paid {"person is" if len(ghost) == 1 else "people are"} not on the staff list, e.g. {ghost[0]["name"]} ({ghost[0]["emp"]}), {f.money(ghost[0]["amount"])}.', 'high', 'Confirm with HR in person before raising it with management.'))
    twice = [x for x in flags if 'twice' in x['why']]
    if twice:
        findings.append(finding(f'{len(twice)} salaries were paid twice in the same month ({f.money(sum(x["amount"] for x in twice))}).', 'high', 'Recover through next month’s payroll.'))
    if len(spikes):
        findings.append(finding(f'{len(spikes)} overtime payments are far above the person’s usual.', 'medium', 'Check they were approved.'))
    if not flags:
        findings.append(finding('No payroll errors found.', 'high'))
    if not d.has('staff'):
        findings.append(finding('Without a staff list, ghost employees and pay after leaving can’t be checked.', 'medium'))
    return result(
        [kpi('Payroll lines checked', f.num(len(p))), kpi('Flags', str(len(flags)), tone='bad' if flags else 'good'), kpi('Money involved', f.money(value), tone='bad' if value else 'good')],
        [chart('Flagged payments', table(['Employee', 'Name', 'Month', 'Amount', 'Why'], [[x['emp'], x['name'], x['month'], f.money(x['amount'], exact=True) if x['amount'] else '–', x['why']] for x in flags[:16]] or [['–', '–', '–', '–', 'Nothing flagged']], [False, False, False, True, False], [x['tone'] for x in flags[:16]]), wide=True)],
        findings,
    )


def pay_fairness(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = _staff(d)
    s = s[~s['left'] & s['salary'].notna() & (s['salary'] > 0) & s['gender'].isin(['F', 'M'])].copy()
    if s['gender'].nunique() < 2 or len(s) < 20:
        raise NeedsData('Needs salaries and gender for at least 20 current staff, both women and men.')
    s['female'] = (s['gender'] == 'F').astype(float)
    s['tenure'] = s['tenure_years'].fillna(s['tenure_years'].median()).fillna(0)
    s['role_'] = s['role'].astype(str)
    fit = smf.ols('np.log(salary) ~ female + tenure + C(role_)', data=s).fit(cov_type='HC3')
    b, (lo, hi) = fit.params['female'], fit.conf_int().loc['female']
    gap, glo, ghi = np.exp(b) - 1, np.exp(lo) - 1, np.exp(hi) - 1
    clear = ghi < 0 or glo > 0
    raw = s[s['female'] == 1]['salary'].mean() / s[s['female'] == 0]['salary'].mean() - 1
    mixed = [r for r in s['role_'].unique() if s[(s['role_'] == r)]['female'].nunique() == 2]
    women, men = s[s['female'] == 1], s[s['female'] == 0]
    close = (women['salary'] * -min(0, gap)).sum() * 12 if clear else 0.0
    return result(
        [kpi('Raw gap, women vs men', f.spct(raw), 'all roles mixed together'), kpi('Same role and tenure', f.spct(gap), f'95% range {f.spct(glo)} to {f.spct(ghi)}', 'bad' if clear and gap < 0 else 'good'), kpi('Cost to close it', f.money(close) if close else '–', 'a year' if close else 'no clear gap within roles')],
        [chart('Average monthly pay by role', bars(mixed, [women[women['role_'] == r]['salary'].mean() for r in mixed], extra={'name': 'Men', 'values': [men[men['role_'] == r]['salary'].mean() for r in mixed]}), wide=True)],
        [
            finding(f'In the same role and with the same tenure, women are paid {f.pct(abs(gap))} {"less" if gap < 0 else "more"} than men.', 'high', f'Closing the gap costs about {f.money(close)} a year; review starting salaries first.' if gap < 0 else None) if clear else finding('No clear pay gap between women and men once role and tenure are taken into account.', 'high'),
            finding(f'Much of the raw {f.spct(raw)} gap comes from which roles women and men hold, not from pay within a role.', 'medium') if abs(raw - gap) > abs(gap) else finding('The gap is mostly within roles, not between them.', 'medium'),
        ],
    )


THEMES = [
    ('Pay', r'pay|salar|wage|money|compensation|raise|market rate|راتب|مرتب'),
    ('Workload and overtime', r'workload|overtime|late|hours|too much|stress|burn|ضغط'),
    ('Growth and promotion', r'grow|promot|career|path|learn|develop|ترقية'),
    ('Management', r'manag|boss|leader|listen|micromanag|judged|إدارة|مدير'),
    ('Tools and systems', r'tool|system|software|crash|slow|equipment'),
    ('Team and culture', r'team|culture|colleague|friendly|proud|flexib|environment|فريق'),
    ('Benefits', r'benefit|insurance|leave|vacation|bonus|تأمين'),
]


def survey(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    r = d.t('empsurvey').copy()
    sc = r['score']
    if sc.max() <= 5:
        sc = (sc - 1) / 4 * 10  # 1-5 ratings mapped onto 0-10
    prom, det = (sc >= 9).mean(), (sc <= 6).mean()
    enps = round((prom - det) * 100)
    themes = []
    if 'comment' in r and r['comment'].notna().any():
        for name, pat in THEMES:
            hit = r['comment'].astype(str).str.contains(pat, flags=re.I, regex=True)
            if hit.sum():
                low_q = r[hit & (sc <= 6)]['comment']
                themes.append((name, int(hit.sum()), float(sc[hit].mean()), (low_q.iloc[0] if len(low_q) else r[hit]['comment'].iloc[0])[:180]))
        themes.sort(key=lambda t: t[2])
    charts = []
    findings = [finding(f'eNPS is {enps:+d}: {"more fans than critics" if enps >= 10 else "more critics than fans"}.', 'high')]
    if themes:
        charts += [chart('Average score by what people wrote about', bars([f'{t[0]} ({t[1]})' for t in themes], [t[2] for t in themes], 'num', horizontal=True, tones=['red' if t[2] < 5 else 'amber' if t[2] < 7 else 'green' for t in themes])), chart('In their words', table(['Theme', 'Comment'], [[t[0], f'“{t[3]}”'] for t in themes[:6]]))]
        findings.append(finding(f'{themes[0][0]} is the biggest complaint: {themes[0][1]} comments, average score {themes[0][2]:.1f}.', 'high' if len(r) >= 30 else 'medium', 'Address it before the next survey.'))
    return result(
        [kpi('eNPS', f'{enps:+d}', '−100 to +100', 'good' if enps >= 10 else 'bad'), kpi('Answers', f.num(len(r))), kpi('Promoters (9–10)', f.pct(prom, 0)), kpi('Detractors (0–6)', f.pct(det, 0), tone='bad' if det > 0.4 else None)],
        charts,
        findings,
        notes=['Comments are sorted into themes by keyword rules. With the AI step on, Claude reads each comment and the analyst checks the themes.'] + (['Scores were on a 1–5 scale and were converted to 0–10.'] if r['score'].max() <= 5 else []),
    )


SERVICES = [
    Service('staff-turnover-analysis', 'people', 'Staff turnover analysis', [['staff']], turnover, medium=[['payroll']], adjust=lambda d, l: ('low', 'Under about 50 staff: turnover rate and cost only, no prediction.') if len(d.t('staff')) < 50 else None, preview='Kaplan-Meier survival by tenure; who is likely to leave from a logistic regression on pay against the role’s median, tenure, overtime and role, checked by 5-fold cross-validation.'),
    Service('staffing-plan', 'people', 'Staffing plan', [['sales']], staffing, medium=[['einv']], params=[Param('per', 'Sales one person handles an hour', 100, 1e6, 100, 9000, 'money')], defaults=_staffing_default),
    Service('payroll-error-scan', 'people', 'Payroll error scan', [['payroll', 'staff']], payroll_scan, medium=[['payroll']]),
    Service('pay-fairness-check', 'people', 'Pay fairness check', [['staff']], pay_fairness, preview='Regression of log salary on gender, tenure and role with robust standard errors; the gender coefficient is the gap within the same role and tenure.'),
    Service('employee-survey', 'people', 'Employee survey', [['empsurvey']], survey),
]
