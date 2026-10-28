// All 32 services. Names, what the client gets and the method come from the website's content,
// so the workspace and the site never disagree.

import { departments } from '../../content'
import { accountingServices } from './accounting'
import { dataServices } from './data'
import { marketServices } from './market'
import { marketingServices } from './marketing'
import { peopleServices } from './people'
import { salesServices } from './sales'
import type { ServiceDef } from './types'

const byDept: Record<string, Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>[]> = {
  data: dataServices,
  sales: salesServices,
  marketing: marketingServices,
  accounting: accountingServices,
  people: peopleServices,
  market: marketServices,
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const DEPTS = departments.map((d) => ({ id: d.id, name: d.name.en }))

export const SERVICES: ServiceDef[] = departments.flatMap((d) =>
  d.services.map((svc) => {
    const impl = byDept[d.id].find((x) => x.name === svc.name.en)
    if (!impl) throw new Error(`No engine for service "${svc.name.en}"`)
    return { ...impl, id: slug(svc.name.en), dept: d.id, get: svc.get.en, method: svc.method.en, data: svc.data.en, missing: svc.missing.en }
  }),
)

export const serviceById = (id: string) => SERVICES.find((s) => s.id === id)
