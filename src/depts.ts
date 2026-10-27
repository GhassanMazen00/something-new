import { departments } from './content'

// Departments in the order the site shows them.
const ORDER = ['data', 'marketing', 'sales', 'accounting', 'people', 'market']
export const depts = ORDER.map((id) => departments.find((d) => d.id === id)!)

// Fired by the side menu to open a department tab in the services section.
export const DEPT_EVENT = 'clearline:dept'
