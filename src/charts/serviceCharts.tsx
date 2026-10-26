import type { ReactNode } from 'react'
import { Bars, Bells, Donut, Gauge, Grouped, HBars, Line, Nested, Scatter, Stacked } from './Charts'

// One example chart per service, keyed by the service's English name in content.ts. Made-up data.

const range = (n: number, f: (k: number) => number) => Array.from({ length: n }, (_, k) => Math.round(f(k) * 10) / 10)
const sat = (k: number, scale: number, rate: number) => scale * (1 - Math.exp(-rate * k))

export const CASH = [640, 590, 610, 520, 470, 430, 360, 250, 160, 210, 300, 340, 380]
export const SALES = [42, 45, 43, 48, 51, 49, 53, 56, 54, 58, 61, 60]
export const SALES_FC = [60, 62, 64, 63, 66, 68, 67]

export const serviceCharts: Record<string, ReactNode> = {
  // Data analysis
  'Data health check': <Gauge label="Data health score 87 out of 100" value={87} text="Data health score" />,
  'Business snapshot': (
    <HBars
      label="Share of sales by product"
      items={[
        { label: 'Product A', value: 34, text: '34%' },
        { label: 'Product B', value: 22, text: '22%' },
        { label: 'Product C', value: 14, text: '14%', tone: 'soft' },
        { label: 'Product D', value: 9, text: '9%', tone: 'soft' },
        { label: 'Others', value: 21, text: '21%', tone: 'soft' },
      ]}
    />
  ),

  // Sales
  'Sales forecast, 3 to 12 months': (
    <Line
      label="Monthly sales with a six-month forecast and a likely range"
      series={[
        { values: SALES, area: true },
        { values: SALES_FC, start: 11, dashed: true },
      ]}
      band={{ start: 11, lo: SALES_FC.map((v, k) => v - k * 1.6), hi: SALES_FC.map((v, k) => v + k * 1.6) }}
      xLabels={['Last 12 months', 'Next 6']}
      legend={[
        ['main', 'Actual'],
        ['band', 'Likely range'],
      ]}
    />
  ),
  'Price change what-if': (
    <Line
      label="Profit change against sales drop after an 8% price rise"
      series={[{ values: [26.7, 20.3, 14, 7.7, 1.3, -5, -11.3, -17.7, -24] }]}
      min={-30}
      max={32}
      threshold={{ value: 0, text: 'Break-even' }}
      marks={[{ series: 0, at: 4.21, value: 0, text: 'Sales −21%', tone: 'bad' }]}
      xLabels={['0% sales drop', '40%']}
    />
  ),
  'Product and customer ranking': (
    <Bars
      label="Products sorted by profit with the cumulative share"
      values={[28, 18, 12, 9, 7, 6, 5, 4, 3, 3, 2, 2, 1]}
      highlight={[0, 1, 2, 3]}
      cumulative
      legend={[
        ['main', 'Top 20%'],
        ['ink', 'Running total'],
      ]}
    />
  ),
  'Stock reorder plan': (
    <Line
      label="Stock level falling to the reorder point and refilling"
      series={[{ values: [100, 82, 64, 46, 30, 100, 84, 66, 48, 31, 100, 80, 62], area: true }]}
      threshold={{ value: 35, text: 'Reorder point' }}
      marks={[
        { series: 0, at: 4, tone: 'bad' },
        { series: 0, at: 9, tone: 'bad' },
      ]}
      xLabels={['Week 1', 'Week 13']}
    />
  ),

  // Marketing
  'Customer groups': (
    <Donut
      label="Customers by group"
      center="4,180"
      sub="customers"
      segments={[
        { label: 'Best', value: 18, tone: 'main' },
        { label: 'Loyal', value: 32, tone: 'mid' },
        { label: 'At risk', value: 27, tone: 'soft' },
        { label: 'Lost', value: 23, tone: 'grey' },
      ]}
    />
  ),
  'Ad channel performance': (
    <HBars
      label="Cost to win one customer, by channel"
      items={[
        { label: 'TikTok', value: 95, text: 'EGP 95' },
        { label: 'Instagram', value: 140, text: 'EGP 140', tone: 'soft' },
        { label: 'Facebook', value: 185, text: 'EGP 185', tone: 'soft' },
        { label: 'Google', value: 210, text: 'EGP 210', tone: 'soft' },
      ]}
    />
  ),
  'Budget split across channels': (
    <Line
      label="Sales response to spend, by channel"
      series={[
        { values: range(12, (k) => sat(k, 90, 0.35)) },
        { values: range(12, (k) => sat(k, 70, 0.2)), tone: 'soft' },
        { values: range(12, (k) => sat(k, 45, 0.5)), tone: 'ink' },
      ]}
      xLabels={['Spend →', 'EGP 120k']}
      legend={[
        ['main', 'Search'],
        ['soft', 'Social'],
        ['ink', 'Video'],
      ]}
    />
  ),
  'Customer value and churn': (
    <Line
      label="Share of customers still buying by month since first order"
      series={[{ values: [100, 86, 77, 70, 65, 61, 58, 56, 55, 54], area: true }]}
      max={110}
      marks={[{ series: 0, at: 3, text: '30% gone by month 3', tone: 'bad' }]}
      xLabels={['Month 0', 'Month 9']}
    />
  ),
  'A/B test check': (
    <Bells
      label="Likely conversion rate of version A and version B"
      a={0.4}
      b={0.55}
      legend={[
        ['ink', 'Version A'],
        ['main', 'Version B · 97% sure it wins'],
      ]}
    />
  ),

  // Accounting & finance
  'Error and fraud scan': (
    <Bars
      label="First digit of payments, found against Benford's law"
      values={[30.6, 17.2, 12.4, 9.8, 7.6, 6.5, 5.6, 5.0, 7.3]}
      overlay={[30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]}
      bad={[8]}
      labels={['1', '2', '3', '4', '5', '6', '7', '8', '9']}
      legend={[
        ['soft', 'Found'],
        ['ink', 'Expected'],
        ['bad', 'Too many 9s'],
      ]}
    />
  ),
  'Books, e-invoices and bank, matched': (
    <Grouped
      label="Monthly sales in the books against bank deposits"
      pairs={[
        [120, 120],
        [135, 135],
        [128, 121],
        [142, 142],
        [150, 150],
        [138, 131],
      ]}
      bad={[2, 5]}
      labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
      legend={[
        ['main', 'Books'],
        ['soft', 'Bank'],
        ['bad', 'Mismatch'],
      ]}
    />
  ),
  '13-week cash forecast': (
    <Line
      label="Cash balance over the next 13 weeks against payroll"
      series={[{ values: CASH, area: true }]}
      threshold={{ value: 180, text: 'Payroll', tone: 'bad' }}
      marks={[{ series: 0, at: 8, text: 'Week 9', tone: 'bad' }]}
      xLabels={['Week 1', 'Week 13']}
    />
  ),
  'Profit projection with what-ifs': (
    <Line
      label="Monthly profit with low, likely and high cases"
      series={[
        { values: [210, 225, 218, 240, 236, 250] },
        { values: [250, 262, 270, 281, 290, 302, 311], start: 5, dashed: true },
      ]}
      band={{ start: 5, lo: [250, 248, 244, 241, 236, 232, 226], hi: [250, 276, 296, 318, 340, 362, 384] }}
      xLabels={['Last 6 months', 'Next 6']}
      legend={[
        ['main', 'Likely'],
        ['band', 'Low to high'],
      ]}
    />
  ),
  'Break-even': (
    <Line
      label="Revenue and total cost by units sold, crossing at break-even"
      series={[{ values: range(11, (k) => k * 100) }, { values: range(11, (k) => 300 + k * 60), tone: 'ink' }]}
      marks={[{ series: 0, at: 7.5, value: 750, text: 'Break-even: 750 units' }]}
      xLabels={['0 units', '1,000 units']}
      legend={[
        ['main', 'Revenue'],
        ['ink', 'Total cost'],
      ]}
    />
  ),
  'Exchange rate and inflation impact': (
    <HBars
      label="Profit margin at three exchange rates"
      max={30}
      items={[
        { label: 'EGP 45 / $', value: 24, text: '24%' },
        { label: 'EGP 50 / $', value: 19, text: '19%', tone: 'soft' },
        { label: 'EGP 55 / $', value: 14, text: '14%', tone: 'bad' },
      ]}
    />
  ),

  // People
  'Staff turnover analysis': (
    <HBars
      label="Yearly staff turnover by role"
      items={[
        { label: 'Sales', value: 28, text: '28%', tone: 'bad' },
        { label: 'Warehouse', value: 22, text: '22%' },
        { label: 'Admin', value: 9, text: '9%', tone: 'soft' },
        { label: 'Finance', value: 6, text: '6%', tone: 'soft' },
      ]}
    />
  ),
  'Staffing plan': (
    <Bars
      label="Sales by hour with the staff needed"
      values={[12, 18, 26, 34, 30, 22, 20, 28, 40, 46, 38, 24]}
      overlay={[14, 16, 24, 32, 32, 22, 20, 26, 38, 44, 40, 26]}
      labels={['9', '', '11', '', '13', '', '15', '', '17', '', '19', '']}
      legend={[
        ['main', 'Sales'],
        ['ink', 'Staff needed'],
      ]}
    />
  ),
  'Payroll error scan': (
    <Scatter
      label="Pay against hours worked, with two unusual payments"
      points={[
        [160, 12], [168, 12.8], [172, 13.1], [150, 11.4], [176, 13.6], [182, 14.1], [158, 12.2], [164, 12.6], [170, 13],
        [188, 14.6], [154, 11.8], [178, 13.9], [166, 12.9], [174, 13.4], [60, 13.2], [184, 22.5], [162, 12.4], [180, 14],
      ]}
      outliers={[14, 15]}
      legend={[
        ['main', 'Normal'],
        ['bad', 'Check this'],
      ]}
    />
  ),
  'Pay fairness check': (
    <Scatter
      label="Salary against years of service, with the fair-pay line"
      points={[
        [1, 9], [2, 10.5], [3, 11], [4, 12.4], [5, 13], [6, 14.2], [7, 15.1], [8, 15.6], [9, 17], [10, 17.8],
        [2, 8.1], [4, 10.2], [6, 11.6], [8, 13.1], [3, 12.2], [7, 16.4], [5, 11.1], [9, 15.2],
      ]}
      outliers={[10, 11, 12, 13]}
      fit
      legend={[
        ['main', 'Staff'],
        ['bad', 'Paid below the line'],
        ['ink', 'Fair-pay line'],
      ]}
    />
  ),
  'Employee survey': (
    <Stacked
      label="Employee survey results"
      headline="eNPS +15"
      sub="from 64 answers"
      segments={[
        { label: 'Promoters', value: 41, tone: 'main' },
        { label: 'Passives', value: 33, tone: 'soft' },
        { label: 'Detractors', value: 26, tone: 'bad' },
      ]}
    />
  ),

  // Market research
  'Market size': (
    <Nested
      label="Total, serviceable and obtainable market"
      rings={[
        { name: 'Total market', value: 'EGP 4.2 bn' },
        { name: 'You can serve', value: 'EGP 1.1 bn' },
        { name: 'You can win', value: 'EGP 85 m' },
      ]}
    />
  ),
  'Demand trends': (
    <Line
      label="Search interest over two years with seasonal peaks"
      series={[{ values: [42, 48, 55, 71, 96, 64, 50, 46, 52, 60, 78, 100, 70, 54, 50], area: true }]}
      max={115}
      marks={[
        { series: 0, at: 4, text: 'Peak' },
        { series: 0, at: 11, text: 'Peak' },
      ]}
      xLabels={['2025', '2026']}
    />
  ),
  'Competitor check': (
    <HBars
      label="Average price against competitors"
      max={300}
      items={[
        { label: 'You', value: 240, text: 'EGP 240', tone: 'ink' },
        { label: 'Competitor A', value: 260, text: 'EGP 260', tone: 'soft' },
        { label: 'Competitor B', value: 225, text: 'EGP 225', tone: 'soft' },
        { label: 'Competitor C', value: 280, text: 'EGP 280', tone: 'soft' },
      ]}
    />
  ),
  'Customer survey': (
    <Line
      label="Price test: share saying too cheap and too expensive at each price"
      series={[
        { values: [92, 80, 64, 46, 30, 18, 10, 6] },
        { values: [4, 8, 15, 26, 44, 62, 78, 90], tone: 'ink' },
      ]}
      marks={[{ series: 0, at: 3.59, value: 36.6, text: 'Best price ≈ EGP 255' }]}
      max={100}
      xLabels={['EGP 150', 'EGP 360']}
      legend={[
        ['main', 'Too cheap'],
        ['ink', 'Too expensive'],
      ]}
    />
  ),
  'Market conditions': (
    <Line
      label="Inflation and interest rate, last eight quarters"
      series={[
        { values: [35, 33, 30, 28, 25, 22, 20, 18] },
        { values: [27, 27.5, 27.5, 27, 25, 24, 22, 21], tone: 'ink', dashed: true },
      ]}
      max={40}
      xLabels={['2025 Q1', '2026 Q4']}
      legend={[
        ['main', 'Inflation %'],
        ['ink', 'Interest rate %'],
      ]}
    />
  ),
}
