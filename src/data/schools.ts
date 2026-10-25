import type { Bilingual } from './quests'

export interface School {
  id: string
  name: Bilingual
}

// Starter list. Anyone can add their own school during sign-up.
export const SCHOOLS: School[] = [
  { id: 'cu', name: { en: 'Cairo University', ar: 'جامعة القاهرة' } },
  { id: 'asu', name: { en: 'Ain Shams University', ar: 'جامعة عين شمس' } },
  { id: 'alex', name: { en: 'Alexandria University', ar: 'جامعة الإسكندرية' } },
  { id: 'auc', name: { en: 'American University in Cairo', ar: 'الجامعة الأمريكية بالقاهرة' } },
  { id: 'guc', name: { en: 'German University in Cairo', ar: 'الجامعة الألمانية بالقاهرة' } },
  { id: 'azhar', name: { en: 'Al-Azhar University', ar: 'جامعة الأزهر' } },
  { id: 'mans', name: { en: 'Mansoura University', ar: 'جامعة المنصورة' } },
  { id: 'helwan', name: { en: 'Helwan University', ar: 'جامعة حلوان' } },
  { id: 'aast', name: { en: 'Arab Academy (AAST)', ar: 'الأكاديمية العربية' } },
  { id: 'bue', name: { en: 'British University in Egypt', ar: 'الجامعة البريطانية في مصر' } },
  { id: 'nu', name: { en: 'Nile University', ar: 'جامعة النيل' } },
  { id: 'assiut', name: { en: 'Assiut University', ar: 'جامعة أسيوط' } },
  { id: 'tanta', name: { en: 'Tanta University', ar: 'جامعة طنطا' } },
  { id: 'zag', name: { en: 'Zagazig University', ar: 'جامعة الزقازيق' } },
  { id: 'miu', name: { en: 'Misr International University', ar: 'جامعة مصر الدولية' } },
  { id: 'fue', name: { en: 'Future University in Egypt', ar: 'جامعة المستقبل' } },
]

export const CUSTOM_PREFIX = 'custom:'

export const schoolById = (id: string) => SCHOOLS.find((s) => s.id === id)
