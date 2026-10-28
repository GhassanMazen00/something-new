// Demo accounts and the clients assigned to each analyst. In production these come from the database,
// and the database itself refuses to return a client to an analyst it is not assigned to.

import { deltaData, lotusData, nileData } from './generate'
import type { Client, Dataset } from './types'

export type Analyst = { id: string; name: string; role: 'Analyst' | 'Senior analyst'; initials: string }

export const ANALYSTS: Analyst[] = [
  { id: 'sara', name: 'Sara Adel', role: 'Senior analyst', initials: 'SA' },
  { id: 'omar', name: 'Omar Fathy', role: 'Analyst', initials: 'OF' },
]

const once = (make: () => Dataset) => {
  let ds: Dataset | null = null
  return () => (ds ??= make())
}

export const CLIENTS: Client[] = [
  {
    id: 'nile',
    name: 'Nile Home Furnishings',
    industry: 'Furniture retail · 6 branches · Cairo and Giza',
    sector: 'furniture',
    contact: 'Hesham Mansour, Finance manager',
    analyst: 'sara',
    question: 'How much will we sell in the next six months, and is now the time to open a seventh branch?',
    focus: ['sales-forecast-3-to-12-months', 'branch-and-product-benchmarking', 'break-even', 'stock-reorder-plan'],
    received: '2026-10-12',
    deleteOn: '2026-11-11',
    status: 'Analysing',
    data: once(nileData),
    files: (ds) => [
      { name: 'sales_export_2024-2026.csv', kind: 'sales', rows: ds.sales.length, cols: ['Date', 'Invoice', 'Customer', 'Item code', 'Branch', 'Channel', 'Qty', 'Unit price', 'Unit cost', 'Hour'], uploaded: '2026-10-12' },
      { name: 'price_list_and_costs.xlsx', kind: 'cost', rows: ds.products.length, cols: ['Item code', 'Item', 'Category', 'Price', 'Cost', 'Imported %'], uploaded: '2026-10-12' },
      { name: 'stock_count_sept.xlsx', kind: 'stock', rows: ds.products.length, cols: ['Item code', 'On hand', 'Supplier lead time (days)'], uploaded: '2026-10-13' },
      { name: 'branches.xlsx', kind: 'branches', rows: ds.branches.length, cols: ['Branch', 'Area m²', 'Staff'], uploaded: '2026-10-13' },
      { name: 'hr_staff_list.xlsx', kind: 'staff', rows: ds.staff.length, cols: ['Employee ID', 'Name', 'Role', 'Gender', 'Hire date', 'Leave date', 'Salary', 'Branch'], uploaded: '2026-10-14' },
      { name: 'payroll_24_months.csv', kind: 'payroll', rows: ds.payroll.length, cols: ['Month', 'Employee ID', 'Name', 'Base', 'Overtime', 'Bank account'], uploaded: '2026-10-14' },
      { name: 'monthly_pnl.xlsx', kind: 'pnl', rows: ds.pnl.length, cols: ['Month', 'Revenue', 'COGS', 'Payroll', 'Rent', 'Marketing', 'Other'], uploaded: '2026-10-14' },
      { name: 'ad_spend_weekly.csv', kind: 'ads', rows: ds.ads.length, cols: ['Week', 'Channel', 'Spend', 'New customers', 'Revenue'], uploaded: '2026-10-15' },
    ],
  },
  {
    id: 'lotus',
    name: 'Lotus Beauty',
    industry: 'Online skincare shop · Egypt-wide delivery',
    sector: 'beauty',
    contact: 'Nada Ezzat, Founder',
    analyst: 'sara',
    question: 'Which customers are we losing, and where should next quarter’s ad budget go?',
    focus: ['customer-value-and-churn', 'budget-split-across-channels', 'customer-groups', 'ad-channel-performance'],
    received: '2026-10-19',
    deleteOn: '2026-11-18',
    status: 'Intake',
    data: once(lotusData),
    files: (ds) => [
      { name: 'shopify_orders.csv', kind: 'sales', rows: ds.sales.length, cols: ['Date', 'Order', 'Customer ID', 'Product', 'Channel', 'Qty', 'Price', 'Cost'], uploaded: '2026-10-19' },
      { name: 'products.csv', kind: 'cost', rows: ds.products.length, cols: ['SKU', 'Product', 'Price', 'Cost'], uploaded: '2026-10-19' },
      { name: 'inventory.csv', kind: 'stock', rows: ds.products.length, cols: ['SKU', 'Available', 'Lead time'], uploaded: '2026-10-19' },
      { name: 'ads_weekly_by_channel.csv', kind: 'ads', rows: ds.ads.length, cols: ['Week', 'Channel', 'Spend', 'New customers', 'Revenue'], uploaded: '2026-10-20' },
      { name: 'checkout_ab_test.csv', kind: 'abtest', rows: 2, cols: ['Version', 'Visitors', 'Orders'], uploaded: '2026-10-20' },
      { name: 'price_survey_serum.csv', kind: 'custsurvey', rows: ds.custSurvey?.answers.length ?? 0, cols: ['Too cheap', 'Cheap', 'Expensive', 'Too expensive'], uploaded: '2026-10-21' },
      { name: 'team_survey.csv', kind: 'empsurvey', rows: ds.empSurvey.length, cols: ['Score 0-10', 'Comment'], uploaded: '2026-10-21' },
      { name: 'team_list.xlsx', kind: 'staff', rows: ds.staff.length, cols: ['ID', 'Name', 'Role', 'Gender', 'Start', 'End', 'Salary'], uploaded: '2026-10-21' },
    ],
  },
  {
    id: 'delta',
    name: 'Delta Medical Supplies',
    industry: 'Medical supplies distributor · 118 pharmacies and clinics',
    sector: 'medical',
    contact: 'Tamer Shawky, CFO',
    analyst: 'omar',
    question: 'We think money is leaking somewhere, and cash is always tight.',
    focus: ['error-and-fraud-scan', 'books-e-invoices-and-bank-matched', '13-week-cash-forecast', 'customer-value-and-churn'],
    received: '2026-10-05',
    deleteOn: '2026-11-04',
    status: 'In review',
    data: once(deltaData),
    files: (ds) => [
      { name: 'eta_einvoices_export.csv', kind: 'einv', rows: ds.einv.length, cols: ['Invoice no.', 'Date', 'Customer', 'Total'], uploaded: '2026-10-05' },
      { name: 'general_ledger_2024-2026.xlsx', kind: 'ledger', rows: ds.ledger.length, cols: ['Entry', 'Date', 'Account', 'Party', 'Amount', 'Reference'], uploaded: '2026-10-05' },
      { name: 'bank_statements_cib.pdf', kind: 'bank', rows: ds.bank.length, cols: ['Date', 'Description', 'Amount', 'Reference'], uploaded: '2026-10-06' },
      { name: 'receivables_and_bills.xlsx', kind: 'unpaid', rows: ds.receivables.length + ds.payables.length, cols: ['Reference', 'Party', 'Amount', 'Due date'], uploaded: '2026-10-06' },
      { name: 'price_list.xlsx', kind: 'cost', rows: ds.products.length, cols: ['Item', 'Price', 'Cost', 'Imported %'], uploaded: '2026-10-06' },
      { name: 'pnl_monthly.xlsx', kind: 'pnl', rows: ds.pnl.length, cols: ['Month', 'Revenue', 'COGS', 'Payroll', 'Rent', 'Marketing', 'Other'], uploaded: '2026-10-07' },
      { name: 'staff_and_payroll.xlsx', kind: 'payroll', rows: ds.payroll.length, cols: ['Month', 'Employee', 'Base', 'Overtime', 'Account'], uploaded: '2026-10-07' },
      { name: 'staff_list.xlsx', kind: 'staff', rows: ds.staff.length, cols: ['ID', 'Name', 'Role', 'Gender', 'Hired', 'Left', 'Salary'], uploaded: '2026-10-07' },
    ],
  },
]

export const clientsFor = (analyst: string) => CLIENTS.filter((c) => c.analyst === analyst)
