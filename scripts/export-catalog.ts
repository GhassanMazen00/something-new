// Writes the 32 services' names, descriptions and methods from the website content to the platform,
// so the public site and the analysts' platform describe every service the same way.
import { writeFileSync } from 'node:fs'
import { departments } from '../src/content'

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const out = departments.map((d) => ({
  id: d.id,
  name: d.name.en,
  services: d.services.map((s) => ({ id: slug(s.name.en), name: s.name.en, get: s.get.en, method: s.method.en, data: s.data.en, missing: s.missing.en })),
}))
writeFileSync(process.argv[2], JSON.stringify(out, null, 2) + '\n')
console.log('wrote', out.reduce((a, d) => a + d.services.length, 0), 'services')
