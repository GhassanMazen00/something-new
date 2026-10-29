// What every screen needs: who is signed in, the service catalogue and the file types.

import { createContext, useContext } from 'react'
import type { Catalog, KindT, Me } from './api'

export type Session = { me: Me; catalog: Catalog; kinds: KindT[]; kindLabel: (k: string) => string; signOut: () => void }
export const SessionCtx = createContext<Session | null>(null)
export const useSession = () => useContext(SessionCtx)!
