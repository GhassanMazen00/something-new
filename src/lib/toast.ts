// Tiny global toast: call toast('Saved!') from anywhere, <Toaster /> shows it.
export const TOAST_EVENT = 'irl:toast'

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }))
}
