import type { ReactNode } from 'react'
import { Bells, Grouped, Line } from '../charts/Charts'
import { departments, type T } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { Arrow } from './Icons'

// Not only businesses: four kinds of clients, each with a question we answer and a small picture of the answer.
const AUDIENCES: { who: T; q: T; a: T; uses: T[]; Vis: () => ReactNode }[] = [
  {
    who: { en: 'Researchers and students', ar: 'الباحثون والطلاب' },
    q: { en: 'Did the new teaching method raise test scores?', ar: 'هل رفعت طريقة التدريس الجديدة درجات الاختبار؟' },
    a: { en: 'Yes: 6.8 points higher, a medium effect, very unlikely to be chance. With the methods written up for your thesis or paper.', ar: 'نعم: أعلى بـ6.8 درجة، أثر متوسط يُستبعد أن يكون صدفة. مع كتابة المنهجية لرسالتك أو بحثك.' },
    uses: [
      { en: 'Group comparison', ar: 'مقارنة المجموعات' },
      { en: 'What drives an outcome', ar: 'ما الذي يؤثر في النتيجة' },
    ],
    Vis: () => (
      <Bells
        label="Test scores with the old and the new method"
        a={0.42}
        b={0.55}
        legend={[
          ['ink', 'Old method'],
          ['main', 'New method'],
        ]}
      />
    ),
  },
  {
    who: { en: 'NGOs and public projects', ar: 'المنظمات والمشروعات العامة' },
    q: { en: 'Did our programme actually raise household income?', ar: 'هل رفع برنامجنا دخل الأسر فعلًا؟' },
    a: { en: 'Participants gained EGP 250 a month more than the comparison villages: the programme’s own effect, not the season.', ar: 'زاد دخل المشاركين 250 جنيهًا شهريًا أكثر من قرى المقارنة: أثر البرنامج نفسه وليس الموسم.' },
    uses: [
      { en: 'Before-and-after impact', ar: 'الأثر قبل وبعد' },
      { en: 'Survey analysis', ar: 'تحليل الاستبيانات' },
    ],
    Vis: () => (
      <Grouped
        label="Monthly income before and after, for participants and comparison villages"
        pairs={[
          [410, 750],
          [400, 490],
        ]}
        labels={['Took part', 'Comparison']}
        legend={[
          ['main', 'Before'],
          ['soft', 'After'],
        ]}
      />
    ),
  },
  {
    who: { en: 'Clinics, schools and services', ar: 'العيادات والمدارس والخدمات' },
    q: { en: 'Are waiting times getting longer, and when do they peak?', ar: 'هل تطول مدة الانتظار، ومتى تبلغ ذروتها؟' },
    a: { en: 'Up 9% a year, peaking every January. Next winter needs two more staff on Sundays.', ar: 'ترتفع 9% سنويًا وتبلغ ذروتها كل يناير. الشتاء القادم يحتاج موظفَين إضافيَين أيام الأحد.' },
    uses: [
      { en: 'Trend and forecast', ar: 'الاتجاه والتوقع' },
      { en: 'Natural groups', ar: 'المجموعات الطبيعية' },
    ],
    Vis: () => (
      <Line
        label="Average waiting time by week, with a forecast"
        series={[
          { values: [22, 24, 27, 23, 21, 22, 25, 28, 31, 27, 26, 28], area: true },
          { values: [28, 30, 33, 36, 34, 31], start: 11, dashed: true },
        ]}
        band={{ start: 11, lo: [28, 28, 30, 32, 29, 25], hi: [28, 32, 36, 40, 39, 37] }}
        xLabels={['Last year', 'Next 6 months']}
      />
    ),
  },
  {
    who: { en: 'Operations and engineering', ar: 'التشغيل والهندسة' },
    q: { en: 'Is the line stable, and does it meet the specification?', ar: 'هل خط الإنتاج مستقر، وهل يحقق المواصفات؟' },
    a: { en: 'Stable for 11 weeks, then a run of high readings after a nozzle change. Capability 1.12: close, not yet there.', ar: 'مستقر 11 أسبوعًا، ثم سلسلة قراءات مرتفعة بعد تغيير فوهة. مؤشر القدرة 1.12: قريب لكن لم يصل بعد.' },
    uses: [
      { en: 'Quality and process control', ar: 'ضبط الجودة والعمليات' },
      { en: 'Data profile', ar: 'ملف تعريف البيانات' },
    ],
    Vis: () => (
      <Line
        label="Fill volume against its control limit"
        series={[{ values: [500, 501, 499, 500, 502, 499, 500, 501, 503, 503, 504, 503, 504] }]}
        min={494}
        max={507}
        threshold={{ value: 505, text: 'Limit', tone: 'bad' }}
        marks={[
          { series: 0, at: 9, tone: 'bad' },
          { series: 0, at: 10, tone: 'bad' },
          { series: 0, at: 12, tone: 'bad' },
        ]}
        xLabels={['Week 1', 'Week 13']}
      />
    ),
  },
]

export function AnyData() {
  const { t } = useLang()
  const n = departments.find((d) => d.id === 'general')?.services.length ?? 0
  return (
    <section id="any-data" className="section anydata" aria-labelledby="anydata-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="anydata-h" data-reveal style={order(1)}>
            {t({ en: 'Not a business?', ar: 'لست شركة؟' })} <span className="accent">{t({ en: 'We analyse any data.', ar: 'نحلل أي بيانات.' })}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t({
              en: 'Research results, surveys, programme data, records and readings. Any table works, with the same proven methods and the same person checking every number.',
              ar: 'نتائج الأبحاث والاستبيانات وبيانات البرامج والسجلات والقراءات. أي جدول يصلح، بالطرق المثبتة نفسها ومع مراجعة كل رقم بواسطة شخص.',
            })}
          </p>
        </header>
        <div className="ad-grid">
          {AUDIENCES.map((x, k) => (
            <article key={x.who.en} className="ad-card card" data-reveal style={order(k)}>
              <span className="svc-dept">{t(x.who)}</span>
              <h3>“{t(x.q)}”</h3>
              <div className="ad-vis">
                <x.Vis />
              </div>
              <p className="ad-answer">{t(x.a)}</p>
              <ul className="ad-uses" aria-label={t({ en: 'Services used', ar: 'الخدمات المستخدمة' })}>
                {x.uses.map((u) => (
                  <li key={u.en}>{t(u)}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="explore" data-reveal>
          <a className="btn btn-quiet btn-lg" href="./services.html#general">
            {t({ en: `See the ${n} any-data services`, ar: `تعرّف على خدمات «أي بيانات» (${n})` })} <Arrow />
          </a>
        </div>
      </div>
    </section>
  )
}
