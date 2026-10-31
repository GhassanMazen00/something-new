// One worked example per service, shown on the services page. Made-up companies and numbers, labelled as such.
// Keyed by the service's English name in content.ts.

import type { T } from './content'

export const examples: Record<string, T> = {
  'Data health check': {
    en: 'A furniture retailer’s files scored 71/100: 412 duplicate invoices, 3 missing weeks in March, and 58 products with two different codes.',
    ar: 'حصلت ملفات متجر أثاث على 71 من 100: 412 فاتورة مكررة، و3 أسابيع ناقصة في مارس، و58 منتجًا بكودين مختلفين.',
  },
  'Business snapshot': {
    en: 'Sales grew 13% on last year; five products brought 31% of it, and the Giza branch fell 9% while the others grew.',
    ar: 'نمت المبيعات 13% عن العام الماضي؛ خمسة منتجات جلبت 31% منها، وتراجع فرع الجيزة 9% بينما نمت الفروع الأخرى.',
  },
  'Data cleaning and merging': {
    en: 'Four Excel exports and a POS file became one table of 29,783 clean lines; “Al Nour Co.” and “El-Nour” merged into one customer.',
    ar: 'تحولت أربعة ملفات Excel وملف نقاط بيع إلى جدول واحد من 29,783 سطرًا نظيفًا؛ ودُمج «النور» و«شركة النور» في عميل واحد.',
  },
  'KPI dashboard': {
    en: 'September: sales EGP 17.8M (6% under target), gross margin 52%, 1,065 orders; four of the last six months hit target.',
    ar: 'سبتمبر: مبيعات 17.8 مليون جنيه (أقل من الهدف بـ6%)، وهامش إجمالي 52%، و1,065 طلبًا؛ وتحقق الهدف في أربعة من آخر ستة أشهر.',
  },
  'Trends and seasonality': {
    en: 'Fridays and Saturdays sell 30% above an average day; sales rise 45% in the two weeks before Ramadan and drop 26% during it.',
    ar: 'تبيع أيام الجمعة والسبت 30% فوق اليوم المعتاد؛ وترتفع المبيعات 45% في الأسبوعين قبل رمضان وتنخفض 26% خلاله.',
  },
  'Driver analysis': {
    en: 'Promotions add EGP 21,000 a day; a 10% price rise costs EGP 9,000 a day in lost sales; weather made no clear difference.',
    ar: 'تضيف العروض 21,000 جنيه يوميًا؛ ورفع الأسعار 10% يكلّف 9,000 جنيه يوميًا من المبيعات؛ ولم يُحدث الطقس فرقًا واضحًا.',
  },
  'Branch and product benchmarking': {
    en: 'Per square metre, Maadi sells 38% above the average branch and Nasr City 24% below, although Nasr City has the most sales in total.',
    ar: 'لكل متر مربع، يبيع فرع المعادي 38% فوق متوسط الفروع ومدينة نصر 24% أقل، رغم أن مدينة نصر الأعلى مبيعًا إجمالًا.',
  },
  'Sales forecast, 3 to 12 months': {
    en: 'Next six months: EGP 110.9M, most likely between 98.8M and 123.0M; January is the peak. Tested on 6 months it hadn’t seen: 8% off.',
    ar: 'الأشهر الستة القادمة: 110.9 مليون جنيه، والأرجح بين 98.8 و123.0 مليون؛ ويناير هو الذروة. اختُبر على 6 أشهر لم يرها: خطأ 8%.',
  },
  'Price change what-if': {
    en: 'An 8% rise on group B pays off unless unit sales fall more than 21%; the expected fall, from your own past price changes, is 7%.',
    ar: 'رفع أسعار المجموعة B بنسبة 8% مربح ما لم تنخفض الكميات أكثر من 21%؛ والانخفاض المتوقع من تغييرات أسعارك السابقة 7%.',
  },
  'Product and customer ranking': {
    en: '11 of 24 products bring 80% of sales; 5 bring under 5% and tie up EGP 340,000 of stock. The top 20% of customers bring 53%.',
    ar: '11 من 24 منتجًا تجلب 80% من المبيعات؛ و5 منتجات تجلب أقل من 5% وتحتجز مخزونًا بـ340,000 جنيه. وأعلى 20% من العملاء يجلبون 53%.',
  },
  'Stock reorder plan': {
    en: 'Order 3 products this week before they run out; 4 others hold more than five months of stock, worth EGP 1.2M.',
    ar: 'اطلب 3 منتجات هذا الأسبوع قبل نفادها؛ و4 منتجات أخرى لديها مخزون يكفي أكثر من خمسة أشهر بقيمة 1.2 مليون جنيه.',
  },
  'Customer groups': {
    en: '1,461 best customers (34%) bring 71% of sales; 750 who used to buy have gone quiet, after spending EGP 894K last year.',
    ar: '1,461 من أفضل العملاء (34%) يجلبون 71% من المبيعات؛ و750 عميلًا توقفوا عن الشراء بعد أن أنفقوا 894 ألف جنيه العام الماضي.',
  },
  'Ad channel performance': {
    en: 'A new customer costs EGP 140 on Instagram and EGP 410 on Google; Instagram pays back in 2 months, Google in 7.',
    ar: 'يكلّف العميل الجديد 140 جنيهًا على إنستجرام و410 جنيهات على جوجل؛ وتُسترد تكلفة إنستجرام في شهرين وجوجل في 7 أشهر.',
  },
  'Budget split across channels': {
    en: 'The same weekly budget, moved from print to Facebook and search, would bring about 29% more sales a week.',
    ar: 'الميزانية الأسبوعية نفسها، بعد نقلها من الإعلانات المطبوعة إلى فيسبوك والبحث، قد تجلب نحو 29% مبيعات أكثر أسبوعيًا.',
  },
  'Customer value and churn': {
    en: '134 regular customers are fading: they used to order every three weeks and have been quiet for two months. They spent EGP 281K last year.',
    ar: '134 عميلًا دائمًا يبتعدون: كانوا يطلبون كل ثلاثة أسابيع وتوقفوا منذ شهرين. وأنفقوا 281 ألف جنيه العام الماضي.',
  },
  'A/B test check': {
    en: 'The new checkout converted 5.7% against 5.4%. The difference could easily be chance (p = 0.28): keep testing for three more weeks.',
    ar: 'حوّلت صفحة الدفع الجديدة 5.7% مقابل 5.4%. قد يكون الفرق صدفة (p = 0.28): استمر في الاختبار ثلاثة أسابيع أخرى.',
  },
  'Error and fraud scan': {
    en: 'Two supplier invoices were paid twice (EGP 37,600), and nine payments sit just under the EGP 50,000 approval limit.',
    ar: 'دُفعت فاتورتان لمورّد مرتين (37,600 جنيه)، وتسع دفعات تقع مباشرة تحت حد الموافقة البالغ 50,000 جنيه.',
  },
  'Books, e-invoices and bank, matched': {
    en: '14 e-invoices worth EGP 212,000 are missing from the books, and 11 bank deposits have no matching invoice.',
    ar: '14 فاتورة إلكترونية بقيمة 212,000 جنيه غير مسجلة في الدفاتر، و11 إيداعًا بنكيًا بلا فاتورة مقابلة.',
  },
  '13-week cash forecast': {
    en: 'Cash falls below payroll in week 9 and bottoms out at −EGP 512K. Collecting three overdue invoices by 20 February covers it.',
    ar: 'تنخفض السيولة عن قيمة الرواتب في الأسبوع 9 وتصل إلى أدنى نقطة عند −512 ألف جنيه. وتحصيل ثلاث فواتير متأخرة قبل 20 فبراير يغطي ذلك.',
  },
  'Profit projection with what-ifs': {
    en: 'With 10% growth and a 15% wage rise, next year’s profit is most likely EGP 2.9M, between 2.6M and 3.2M; two months may make a loss.',
    ar: 'مع نمو 10% وزيادة أجور 15%، الربح المرجّح العام القادم 2.9 مليون جنيه، بين 2.6 و3.2 مليون؛ وقد يخسر شهران.',
  },
  'Break-even': {
    en: 'You break even at EGP 1.4M of sales a month; you sell 2.1M, so sales could fall 33% before you make a loss.',
    ar: 'تصل إلى نقطة التعادل عند مبيعات 1.4 مليون جنيه شهريًا؛ وأنت تبيع 2.1 مليون، فيمكن أن تنخفض المبيعات 33% قبل الخسارة.',
  },
  'Exchange rate and inflation impact': {
    en: 'At 55 pounds to the dollar, the gross margin falls from 35% to 24% unless imported lines rise in price by 9%.',
    ar: 'عند 55 جنيهًا للدولار، ينخفض الهامش الإجمالي من 35% إلى 24% ما لم ترتفع أسعار الأصناف المستوردة 9%.',
  },
  'Staff turnover analysis': {
    en: '16% of staff left last year, costing about EGP 3.4M to replace; drivers and cashiers leave most, mostly in their first six months.',
    ar: 'ترك 16% من الموظفين العمل العام الماضي، بتكلفة استبدال نحو 3.4 مليون جنيه؛ والسائقون والكاشيرات الأكثر مغادرة، غالبًا في أول ستة أشهر.',
  },
  'Staffing plan': {
    en: 'Fridays from 6 to 9 pm need 6 people on the floor; Monday mornings need 2. Moving two shifts saves a hire.',
    ar: 'تحتاج أيام الجمعة من 6 إلى 9 مساءً إلى 6 أشخاص في الصالة؛ وصباح الاثنين إلى شخصين. ونقل ورديتين يوفر تعيينًا جديدًا.',
  },
  'Payroll error scan': {
    en: 'One person on the payroll is not on the staff list (EGP 170K over ten months), and two overtime payments are four times the usual.',
    ar: 'شخص في كشف الرواتب غير موجود في قائمة الموظفين (170 ألف جنيه خلال عشرة أشهر)، ودفعتا عمل إضافي أربعة أضعاف المعتاد.',
  },
  'Pay fairness check': {
    en: 'In the same role and with the same tenure, women are paid 9% less (95% range 4% to 14%); closing it costs EGP 410K a year.',
    ar: 'في الوظيفة نفسها وبالأقدمية نفسها، تتقاضى النساء 9% أقل (المدى 4% إلى 14%)؛ وتكلفة سد الفجوة 410 آلاف جنيه سنويًا.',
  },
  'Employee survey': {
    en: 'eNPS is −12. Pay and overtime come up in 41% of comments; the team and the manager are praised most.',
    ar: 'مؤشر eNPS يساوي −12. يُذكر الأجر والعمل الإضافي في 41% من التعليقات؛ ويُشاد بالفريق والمدير أكثر من غيرهما.',
  },
  'Market size': {
    en: 'Home furniture in Greater Cairo is worth about EGP 9B a year; you hold about 2.4% of the part you can reach.',
    ar: 'سوق أثاث المنازل في القاهرة الكبرى يبلغ نحو 9 مليارات جنيه سنويًا؛ وتملك نحو 2.4% من الجزء الذي يمكنك الوصول إليه.',
  },
  'Demand trends': {
    en: 'Searches for “sofa beds” rise every year from August and peak in October; this year they are 18% above last year.',
    ar: 'ترتفع عمليات البحث عن «كنب سرير» كل عام بداية من أغسطس وتبلغ ذروتها في أكتوبر؛ وهي هذا العام أعلى 18% من العام الماضي.',
  },
  'Competitor check': {
    en: 'You are 7% dearer than Rival One on average, but 12% cheaper on your top ten products; their reviews complain most about delivery.',
    ar: 'أسعارك أعلى 7% من المنافس الأول في المتوسط، لكنها أرخص 12% في أهم عشرة منتجات؛ وأكثر شكاوى عملائه عن التوصيل.',
  },
  'Customer survey': {
    en: 'For the new serum, an acceptable price is EGP 420 to 560; above 560 a third of buyers say it’s too expensive.',
    ar: 'للسيروم الجديد، السعر المقبول بين 420 و560 جنيهًا؛ وفوق 560 يرى ثلث المشترين أنه غالٍ جدًا.',
  },
  'Market conditions': {
    en: 'In the base case, inflation trims your margin from 35% to 31% next year; in a currency shock it falls to 17%.',
    ar: 'في السيناريو الأساسي يخفض التضخم هامشك من 35% إلى 31% العام القادم؛ وفي صدمة العملة ينخفض إلى 17%.',
  },
}

// The six shown on the home page.
export const topServices = [
  'Sales forecast, 3 to 12 months',
  'Error and fraud scan',
  '13-week cash forecast',
  'Customer value and churn',
  'Price change what-if',
  'Payroll error scan',
]
